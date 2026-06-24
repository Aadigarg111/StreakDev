import { NextResponse } from "next/server";
import { normalizedAnswerMatch } from "@/lib/answer-normalization";

export const runtime = "nodejs";

type CheckAnswerRequest = {
  exerciseId?: string;
  userAnswer?: unknown;
  correctAnswer?: unknown;
  exercisePrompt?: unknown;
  language?: unknown;
  exerciseType?: unknown;
};

type CheckAnswerResponse = {
  correct: boolean | null;
  feedback: string | null;
  method:
    | "exact_match"
    | "gemini_semantic"
    | "fallback_error"
    | "fallback_parse_error"
    | "fallback_unconfigured"
    | "invalid_request";
};

const semanticCache = new Map<string, CheckAnswerResponse>();
const maxCacheEntries = 600;

function stableAnswer(value: string | string[]) {
  return Array.isArray(value) ? value.join("\n---OR---\n") : value;
}

function cacheKey(exerciseId: string, userAnswer: string) {
  return `${exerciseId}:${userAnswer.trim().toLowerCase()}`;
}

function setCached(key: string, response: CheckAnswerResponse) {
  if (semanticCache.size >= maxCacheEntries) {
    const oldestKey = semanticCache.keys().next().value as string | undefined;
    if (oldestKey) {
      semanticCache.delete(oldestKey);
    }
  }

  semanticCache.set(key, response);
}

function parseRequest(payload: CheckAnswerRequest) {
  const userAnswer =
    typeof payload.userAnswer === "string" ? payload.userAnswer : "";
  const correctAnswer = Array.isArray(payload.correctAnswer)
    ? payload.correctAnswer.filter((answer): answer is string => typeof answer === "string")
    : typeof payload.correctAnswer === "string"
      ? payload.correctAnswer
      : "";

  return {
    exerciseId:
      typeof payload.exerciseId === "string" && payload.exerciseId.trim()
        ? payload.exerciseId.trim()
        : "unknown-exercise",
    userAnswer,
    correctAnswer,
    exercisePrompt:
      typeof payload.exercisePrompt === "string" ? payload.exercisePrompt : "",
    language: typeof payload.language === "string" ? payload.language : "code",
    exerciseType:
      typeof payload.exerciseType === "string" ? payload.exerciseType : "type_function",
  };
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function checkWithGemini({
  correctAnswer,
  exercisePrompt,
  language,
  userAnswer,
}: {
  userAnswer: string;
  correctAnswer: string | string[];
  exercisePrompt: string;
  language: string;
}): Promise<CheckAnswerResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      correct: null,
      feedback: "We couldn't verify this automatically, so it will not cost a heart.",
      method: "fallback_unconfigured",
    };
  }

  const systemInstruction = `You are grading a coding exercise answer. Judge whether the student's code is FUNCTIONALLY CORRECT for the given task, not whether it matches the reference answer's exact wording, formatting, or variable names. Accept different but valid approaches. Respond ONLY with valid JSON, no markdown formatting, no preamble: {"correct": true or false, "feedback": "one short sentence explaining why, written for the student"}`;
  const userContent = `Task: ${exercisePrompt}
Language: ${language}
Reference correct answer for context, not exact matching: ${stableAnswer(correctAnswer)}
Student answer: ${userAnswer}`;

  try {
    const response = await fetchWithTimeout(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userContent }] }],
          generationConfig: { temperature: 0, maxOutputTokens: 150 },
        }),
      },
      6000,
    );

    if (!response.ok) {
      console.error("Gemini check failed:", response.status);
      return {
        correct: null,
        feedback: "We couldn't verify this automatically, so it will not cost a heart.",
        method: "fallback_error",
      };
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean) as { correct?: unknown; feedback?: unknown };

    if (typeof parsed.correct !== "boolean") {
      throw new Error("Gemini JSON did not include a boolean correct field.");
    }

    return {
      correct: parsed.correct,
      feedback:
        typeof parsed.feedback === "string" && parsed.feedback.trim()
          ? parsed.feedback.trim()
          : parsed.correct
            ? "That solution is functionally correct."
            : "That solution does not satisfy the task yet.",
      method: "gemini_semantic",
    };
  } catch (error) {
    console.error("Gemini semantic check failed:", error);
    return {
      correct: null,
      feedback: "We couldn't verify this automatically, so it will not cost a heart.",
      method: "fallback_parse_error",
    };
  }
}

export async function POST(request: Request) {
  let payload: CheckAnswerRequest;

  try {
    payload = (await request.json()) as CheckAnswerRequest;
  } catch {
    return NextResponse.json(
      {
        correct: null,
        feedback: "The answer payload could not be read.",
        method: "invalid_request",
      } satisfies CheckAnswerResponse,
      { status: 400 },
    );
  }

  const parsed = parseRequest(payload);
  const { correctAnswer, exerciseId, exercisePrompt, exerciseType, language, userAnswer } =
    parsed;

  if (!userAnswer.trim() || (Array.isArray(correctAnswer) && correctAnswer.length === 0) || correctAnswer === "") {
    return NextResponse.json(
      {
        correct: null,
        feedback: "The answer payload is incomplete.",
        method: "invalid_request",
      } satisfies CheckAnswerResponse,
      { status: 400 },
    );
  }

  const mode = exerciseType === "type_function" ? "code" : "text";
  if (normalizedAnswerMatch(userAnswer, correctAnswer, mode)) {
    return NextResponse.json({
      correct: true,
      feedback: null,
      method: "exact_match",
    } satisfies CheckAnswerResponse);
  }

  const key = cacheKey(exerciseId, userAnswer);
  const cached = semanticCache.get(key);
  if (cached) {
    return NextResponse.json(cached);
  }

  const result = await checkWithGemini({
    correctAnswer,
    exercisePrompt,
    language,
    userAnswer,
  });
  setCached(key, result);

  return NextResponse.json(result);
}
