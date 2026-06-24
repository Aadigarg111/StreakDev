"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowUp, Heart, LoaderCircle, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Exercise, Lesson } from "../../../types/content";
import type { LessonCompletionPayload } from "@/store/user-progress";
import { Bity } from "@/components/mascot/bity";
import { DuoButton } from "@/components/ui/duo-button";
import { cn } from "@/lib/cn";
import { playFeedback } from "@/lib/feedback-effects";
import {
  formatCorrectAnswer,
  hasLessonAnswer,
  isLessonAnswerCorrect,
  type LessonAnswer,
} from "@/lib/lesson-checking";
import { enterImmersiveMode, exitImmersiveMode } from "@/lib/immersive-mode";

type LessonSessionProps = {
  trackId: string;
  sectionOrder: number;
  unitOrder: number;
  unitId: string;
  unitTitle: string;
  lesson: Lesson;
  exercises: Exercise[];
  hearts: number;
  maxHearts: number;
  onLoseHeart: () => number;
  onRefillHearts: (mode: "practice" | "gems") => void;
  onCompleteLesson: (payload: LessonCompletionPayload) => void;
  onExit: () => void;
};

type FeedbackState = {
  correct: boolean;
  exercise: Exercise;
  feedbackText?: string | null;
  neutral?: boolean;
  method?: string;
};

type SemanticCheckResponse = {
  correct: boolean | null;
  feedback: string | null;
  method: string;
};

function getInitialAnswer(exercise?: Exercise): LessonAnswer {
  if (!exercise) {
    return "";
  }

  if (exercise.type === "drag_reorder") {
    return exercise.options ?? [];
  }

  return "";
}

function ConfettiBurst({ active }: { active: boolean }) {
  const reducedMotion = useReducedMotion();

  if (!active || reducedMotion) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, index) => (
        <motion.span
          animate={{
            opacity: [0, 1, 0],
            rotate: [0, 120],
            x: [0, (index % 2 === 0 ? 1 : -1) * (40 + index * 5)],
            y: [0, 120 + index * 3],
          }}
          className="absolute left-1/2 top-8 h-3 w-2 rounded-sm"
          initial={{ opacity: 0 }}
          key={index}
          style={{
            backgroundColor: ["#58CC02", "#1CB0F6", "#FFC800", "#CE82FF"][index % 4],
          }}
          transition={{ delay: index * 0.02, duration: 0.9, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function CodeBlock({ codeSnippet }: { codeSnippet: string }) {
  return (
    <div className="relative mt-4">
      <pre className="overflow-x-auto rounded-duo border-2 border-duo-swan bg-duo-grey-panel p-4 text-sm font-bold leading-6 text-duo-eel">
        <code>{codeSnippet}</code>
      </pre>
      <span
        aria-hidden
        className="pointer-events-none absolute right-0 top-0 h-full w-8 rounded-r-duo bg-gradient-to-l from-duo-grey-panel to-transparent"
      />
    </div>
  );
}

function ChoiceGrid({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (option: string) => void;
}) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      {options.map((option) => (
        <button
          className={cn(
            "touch-target no-select-interactive min-h-16 rounded-duo border-2 bg-duo-snow p-4 text-left font-black text-duo-eel transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
            selected === option
              ? "border-duo-green bg-[#F1FFE8]"
              : "border-duo-swan hover:border-duo-green",
          )}
          key={option}
          onClick={() => {
            playFeedback("tap");
            onSelect(option);
          }}
          type="button"
        >
          {option}
        </button>
      ))}
    </div>
  );
}

function SpotBugAnswer({
  codeSnippet,
  selectedLine,
  onSelect,
}: {
  codeSnippet: string;
  selectedLine: string;
  onSelect: (lineId: string) => void;
}) {
  return (
    <div className="mt-5 overflow-hidden rounded-duo border-2 border-duo-swan bg-duo-grey-panel">
      {codeSnippet.split("\n").map((line, index) => {
        const lineId = `line-${index + 1}`;

        return (
          <button
            className={cn(
              "touch-target grid w-full grid-cols-[44px_minmax(0,1fr)] border-b border-duo-swan text-left font-bold last:border-b-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
              selectedLine === lineId && "bg-[#F1FFE8] text-duo-green-dark",
            )}
            key={lineId}
            onClick={() => {
              playFeedback("tap");
              onSelect(lineId);
            }}
            type="button"
          >
            <span className="bg-duo-swan/60 px-3 py-3 text-right text-xs font-black text-duo-grey-disabled">
              {index + 1}
            </span>
            <code className="min-w-0 overflow-x-auto whitespace-pre px-3 py-3 text-sm">
              {line || " "}
            </code>
          </button>
        );
      })}
    </div>
  );
}

function DragReorderAnswer({
  blocks,
  onChange,
}: {
  blocks: string[];
  onChange: (blocks: string[]) => void;
}) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  function moveBlock(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= blocks.length) {
      return;
    }

    const nextBlocks = [...blocks];
    const [block] = nextBlocks.splice(fromIndex, 1);
    nextBlocks.splice(toIndex, 0, block);
    onChange(nextBlocks);
    playFeedback("tap");
  }

  return (
    <div className="mt-5 space-y-3">
      {blocks.map((block, index) => (
        <div
          className="no-select-interactive grid grid-cols-[minmax(0,1fr)_auto] gap-2 rounded-duo border-2 border-duo-swan bg-duo-snow p-3"
          draggable
          key={block}
          onDragOver={(event) => event.preventDefault()}
          onDragStart={() => setDraggedIndex(index)}
          onDrop={() => {
            if (draggedIndex !== null) {
              moveBlock(draggedIndex, index);
              setDraggedIndex(null);
            }
          }}
        >
          <code className="min-w-0 self-center overflow-x-auto whitespace-pre text-sm font-bold text-duo-eel">
            {block}
          </code>
          <div className="flex gap-1">
            <button
              aria-label={`Move block ${index + 1} up`}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-duo-swan text-duo-grey-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25"
              onClick={() => moveBlock(index, index - 1)}
              type="button"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
            <button
              aria-label={`Move block ${index + 1} down`}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-duo-swan text-duo-grey-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25"
              onClick={() => moveBlock(index, index + 1)}
              type="button"
            >
              <ArrowDown className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExerciseAnswer({
  exercise,
  answer,
  onChange,
}: {
  exercise: Exercise;
  answer: LessonAnswer;
  onChange: (answer: LessonAnswer) => void;
}) {
  if (exercise.type === "multiple_choice" || exercise.type === "predict_output") {
    return (
      <ChoiceGrid
        onSelect={onChange}
        options={exercise.options ?? []}
        selected={Array.isArray(answer) ? "" : answer}
      />
    );
  }

  if (exercise.type === "fill_blank") {
    return (
      <label className="mt-5 block">
        <span className="text-sm font-black text-duo-grey-text">Your answer</span>
        <input
          className="mt-2 h-14 w-full rounded-duo border-2 border-duo-swan px-4 text-lg font-black text-duo-eel outline-none focus:border-duo-blue focus:ring-4 focus:ring-duo-blue/20"
          onChange={(event) => onChange(event.target.value)}
          value={Array.isArray(answer) ? "" : answer}
        />
      </label>
    );
  }

  if (exercise.type === "spot_bug" && exercise.codeSnippet) {
    return (
      <SpotBugAnswer
        codeSnippet={exercise.codeSnippet}
        onSelect={onChange}
        selectedLine={Array.isArray(answer) ? "" : answer}
      />
    );
  }

  if (exercise.type === "drag_reorder") {
    return (
      <DragReorderAnswer
        blocks={Array.isArray(answer) ? answer : exercise.options ?? []}
        onChange={onChange}
      />
    );
  }

  return (
    <label className="mt-5 block">
      <span className="text-sm font-black text-duo-grey-text">Your implementation</span>
      <textarea
        className="mt-2 min-h-40 w-full rounded-duo border-2 border-duo-swan p-4 font-mono text-sm font-bold leading-6 text-duo-eel outline-none focus:border-duo-blue focus:ring-4 focus:ring-duo-blue/20"
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        value={Array.isArray(answer) ? "" : answer}
      />
    </label>
  );
}

function FeedbackPanel({
  feedback,
  xpEarned,
  onContinue,
}: {
  feedback: FeedbackState;
  xpEarned: number;
  onContinue: () => void;
}) {
  return (
    <motion.div
      animate={{ y: 0 }}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t-2 px-4 pb-safe pt-4 shadow-2xl sm:px-5 sm:pt-5",
        feedback.correct
          ? "border-duo-green bg-[#D7FFB8]"
          : "border-duo-red bg-[#FFD9D9]",
      )}
      initial={{ y: 190 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="mx-auto flex max-w-[700px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Bity
            className="h-20 w-20 shrink-0"
            pose={feedback.correct ? "celebrating" : "sad"}
          />
          <div>
            <p
              className={cn(
                "text-2xl font-black",
                feedback.neutral
                  ? "text-duo-blue-dark"
                  : feedback.correct
                    ? "text-duo-green-dark"
                    : "text-duo-red-dark",
              )}
            >
              {feedback.neutral ? "Marked for review" : feedback.correct ? "Nailed it!" : "Not quite"}
            </p>
            <p className="mt-1 text-sm font-bold text-duo-eel">
              {feedback.neutral
                ? "No heart lost"
                : feedback.correct
                ? `+${xpEarned} XP`
                : `Correct answer: ${formatCorrectAnswer(feedback.exercise)}`}
            </p>
            <p className="mt-1 text-sm font-bold text-duo-grey-text">
              {feedback.feedbackText ?? feedback.exercise.explanation}
            </p>
          </div>
        </div>
        <DuoButton
          className="w-full sm:min-w-44"
          onClick={() => {
            playFeedback("tap");
            onContinue();
          }}
          variant={feedback.neutral ? "blue" : feedback.correct ? "green" : "red"}
        >
          Continue
        </DuoButton>
      </div>
    </motion.div>
  );
}

function ExitConfirm({
  onCancel,
  onExit,
}: {
  onCancel: () => void;
  onExit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/30 p-4">
      <motion.div
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5 text-center"
        initial={{ scale: 0.96, opacity: 0 }}
      >
        <Bity className="mx-auto h-24 w-24" pose="sad" />
        <h2 className="mt-3 text-2xl font-black">Are you sure?</h2>
        <p className="mt-2 text-sm font-bold text-duo-grey-text">
          You&apos;ll lose your progress on this lesson.
        </p>
        <div className="mt-5 grid gap-3">
          <DuoButton onClick={onCancel}>Keep learning</DuoButton>
          <DuoButton onClick={onExit} variant="grey">
            Exit lesson
          </DuoButton>
        </div>
      </motion.div>
    </div>
  );
}

function OutOfHeartsScreen({
  onPractice,
  onUseGems,
  onExit,
}: {
  onPractice: () => void;
  onUseGems: () => void;
  onExit: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-duo-grey-bg p-4 pb-safe pt-safe text-duo-eel">
      <div className="w-full max-w-md rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-6 text-center">
        <Bity className="mx-auto" pose="sad" />
        <h1 className="mt-4 text-3xl font-black">Out of hearts</h1>
        <p className="mt-2 text-base font-bold text-duo-grey-text">
          Take a breather, practice to refill one heart, or spend gems to refill now.
        </p>
        <div className="mt-6 grid gap-3">
          <DuoButton onClick={onPractice}>Practice to refill</DuoButton>
          <DuoButton onClick={onUseGems} variant="purple">
            Use gems to refill
          </DuoButton>
          <DuoButton onClick={onExit} variant="grey">
            Wait 4h
          </DuoButton>
        </div>
      </div>
    </main>
  );
}

function SummaryScreen({
  accuracy,
  durationSeconds,
  xpEarned,
  streakExtended,
  onContinue,
}: {
  accuracy: number;
  durationSeconds: number;
  xpEarned: number;
  streakExtended: boolean;
  onContinue: () => void;
}) {
  const [displayedXp, setDisplayedXp] = useState(0);

  useEffect(() => {
    if (xpEarned === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setDisplayedXp((current) => {
        if (current >= xpEarned) {
          window.clearInterval(interval);
          return xpEarned;
        }

        return Math.min(xpEarned, current + 2);
      });
    }, 35);

    return () => window.clearInterval(interval);
  }, [xpEarned]);

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-duo-grey-bg p-4 pb-safe pt-safe text-duo-eel">
      <ConfettiBurst active />
      <div className="w-full max-w-lg rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-6 text-center">
        <Bity className="mx-auto" pose="celebrating" />
        <h1 className="mt-4 text-[clamp(2rem,8vw,2.5rem)] font-black tracking-normal">
          Lesson complete!
        </h1>
        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="rounded-duo border-2 border-duo-swan bg-duo-grey-panel p-3">
            <p className="text-xs font-black text-duo-grey-disabled">XP</p>
            <p className="text-2xl font-black text-duo-yellow-dark">{displayedXp}</p>
          </div>
          <div className="rounded-duo border-2 border-duo-swan bg-duo-grey-panel p-3">
            <p className="text-xs font-black text-duo-grey-disabled">Accuracy</p>
            <p className="text-2xl font-black text-duo-green-dark">{accuracy}%</p>
          </div>
          <div className="rounded-duo border-2 border-duo-swan bg-duo-grey-panel p-3">
            <p className="text-xs font-black text-duo-grey-disabled">Time</p>
            <p className="text-2xl font-black text-duo-blue-dark">{durationSeconds}s</p>
          </div>
        </div>
        {streakExtended && (
          <motion.div
            animate={{ scale: [1, 1.08] }}
            className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-duo-yellow px-4 py-2 text-sm font-black"
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 20,
              repeat: 4,
              repeatType: "mirror",
            }}
          >
            <span>Streak extended</span>
          </motion.div>
        )}
        <DuoButton className="mt-7 w-full" onClick={onContinue}>
          Continue
        </DuoButton>
      </div>
    </main>
  );
}

export function LessonSession({
  trackId,
  sectionOrder,
  unitOrder,
  unitId,
  unitTitle,
  lesson,
  exercises,
  hearts,
  maxHearts,
  onLoseHeart,
  onRefillHearts,
  onCompleteLesson,
  onExit,
}: LessonSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState<LessonAnswer>(() => getInitialAnswer(exercises[0]));
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [phase, setPhase] = useState<"lesson" | "summary" | "out-of-hearts">("lesson");
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [heartBreaking, setHeartBreaking] = useState(false);
  const [checking, setChecking] = useState(false);
  const startTimeRef = useRef(Date.now());
  const completedTodayRef = useRef(false);
  const exercise = exercises[currentIndex];
  const xpPerCorrect = 10;
  const xpEarned = correctCount * xpPerCorrect;
  const progressPercent = ((currentIndex + (feedback ? 1 : 0)) / exercises.length) * 100;

  useEffect(() => {
    setAnswer(getInitialAnswer(exercise));
    setFeedback(null);
    setChecking(false);
  }, [exercise]);

  useEffect(() => {
    void enterImmersiveMode();

    return () => {
      void exitImmersiveMode();
    };
  }, []);

  if (exercises.length === 0) {
    return (
      <main className="grid min-h-dvh place-items-center bg-duo-grey-bg p-4 pb-safe pt-safe text-duo-eel">
        <div className="max-w-md rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-6 text-center">
          <Bity className="mx-auto" pose="sad" />
          <h1 className="mt-4 text-2xl font-black">No exercises yet</h1>
          <p className="mt-2 text-sm font-bold text-duo-grey-text">
            This unit is waiting for its question bank.
          </p>
          <DuoButton className="mt-5" onClick={onExit}>
            Back to path
          </DuoButton>
        </div>
      </main>
    );
  }

  async function checkSemanticAnswer() {
    if (Array.isArray(answer)) {
      return {
        correct: false,
        feedback: "This answer needs to be typed as code.",
        method: "invalid_client_answer",
      } satisfies SemanticCheckResponse;
    }

    try {
      const response = await fetch("/api/check-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exerciseId: exercise.id,
          exercisePrompt: exercise.prompt,
          exerciseType: exercise.type,
          language: trackId === "sql" ? "SQL" : "JavaScript",
          correctAnswer: exercise.correctAnswer,
          userAnswer: answer,
        }),
      });

      if (!response.ok) {
        return {
          correct: null,
          feedback: "We couldn't verify this automatically, so it will not cost a heart.",
          method: "client_api_error",
        } satisfies SemanticCheckResponse;
      }

      return (await response.json()) as SemanticCheckResponse;
    } catch {
      return {
        correct: null,
        feedback: "We couldn't verify this automatically, so it will not cost a heart.",
        method: "client_network_error",
      } satisfies SemanticCheckResponse;
    }
  }

  async function checkAnswer() {
    if (!hasLessonAnswer(exercise, answer) || feedback || checking) {
      return;
    }

    playFeedback("tap");
    setChecking(true);

    const semanticResult =
      exercise.type === "type_function" ? await checkSemanticAnswer() : null;
    const correct =
      semanticResult?.correct ?? isLessonAnswerCorrect(exercise, answer);
    const neutral = semanticResult?.correct === null;

    setChecking(false);
    setFeedback({
      correct: neutral ? true : correct,
      exercise,
      feedbackText: semanticResult?.feedback,
      neutral,
      method: semanticResult?.method,
    });

    if (neutral) {
      playFeedback("correct");
      return;
    }

    if (correct) {
      setCorrectCount((count) => count + 1);
      playFeedback("correct");
      return;
    }

    setWrongCount((count) => count + 1);
    setHeartBreaking(true);
    window.setTimeout(() => setHeartBreaking(false), 450);
    const nextHearts = onLoseHeart();
    playFeedback("wrong");

    if (nextHearts <= 0) {
      window.setTimeout(() => setPhase("out-of-hearts"), 700);
    }
  }

  function continueLesson() {
    if (currentIndex >= exercises.length - 1) {
      playFeedback("complete");
      completedTodayRef.current = true;
      setPhase("summary");
      return;
    }

    setCurrentIndex((index) => index + 1);
  }

  function finishLesson() {
    const totalAnswers = correctCount + wrongCount;
    const accuracy = Math.round((correctCount / Math.max(1, totalAnswers)) * 100);

    onCompleteLesson({
      trackId,
      sectionOrder,
      unitOrder,
      lessonId: lesson.id,
      unitId,
      xpEarned,
      accuracy,
      perfect: wrongCount === 0,
    });
    onExit();
  }

  if (phase === "out-of-hearts") {
    return (
      <OutOfHeartsScreen
        onExit={onExit}
        onPractice={() => {
          onRefillHearts("practice");
          onExit();
        }}
        onUseGems={() => {
          onRefillHearts("gems");
          onExit();
        }}
      />
    );
  }

  if (phase === "summary") {
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const accuracy = Math.round((correctCount / Math.max(1, exercises.length)) * 100);

    return (
      <SummaryScreen
        accuracy={accuracy}
        durationSeconds={durationSeconds}
        onContinue={finishLesson}
        streakExtended={completedTodayRef.current}
        xpEarned={xpEarned}
      />
    );
  }

  return (
    <main className="immersive-session bg-duo-grey-bg text-duo-eel">
      <div className="mobile-landscape-guard fixed inset-0 z-50 place-items-center bg-duo-grey-bg p-4 text-center text-duo-eel">
        <div className="max-w-sm rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-6">
          <Bity className="mx-auto h-24 w-24" pose="sleeping" />
          <h1 className="mt-4 text-2xl font-black">Rotate your device</h1>
          <p className="mt-2 text-sm font-bold text-duo-grey-text">
            Lessons are tuned for portrait mode so the code, answers, and controls stay readable.
          </p>
        </div>
      </div>

      <div className="mobile-landscape-content min-h-dvh">
        <header className="sticky top-0 z-20 border-b-2 border-duo-swan bg-duo-snow px-3 pb-3 pt-safe xs:px-4">
          <div className="mx-auto grid max-w-[700px] grid-cols-[44px_1fr_auto] items-center gap-3">
            <button
              aria-label="Close lesson"
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-duo-swan text-duo-grey-text focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25"
              onClick={() => setShowExitConfirm(true)}
              type="button"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="h-4 overflow-hidden rounded-full bg-duo-swan">
              <motion.div
                animate={{ width: `${progressPercent}%` }}
                className="h-full rounded-full bg-duo-green"
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
              />
            </div>
            <motion.div
              animate={heartBreaking ? { scale: [1, 1.22] } : undefined}
              className="flex min-h-11 items-center gap-1 rounded-full border-2 border-duo-swan px-3 py-2 text-sm font-black"
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 18,
                repeat: 1,
                repeatType: "mirror",
              }}
            >
              <Heart className="h-5 w-5 fill-duo-red text-duo-red" />
              {hearts}/{maxHearts}
            </motion.div>
          </div>
        </header>

        <section className="mx-auto flex min-h-[calc(100dvh-74px)] max-w-[700px] flex-col px-3 pb-[calc(8rem+env(safe-area-inset-bottom))] pt-6 xs:px-4 sm:pt-7">
          <div className="mb-5 flex items-start gap-3 sm:gap-4">
            <Bity
              className="h-20 w-20 shrink-0 xs:h-24 xs:w-24"
              pose={feedback?.correct ? "celebrating" : feedback ? "sad" : "idle"}
            />
            <div className="min-w-0">
              <p className="text-sm font-black text-duo-green">
                {unitTitle} - Question {currentIndex + 1} of {exercises.length}
              </p>
              <h1 className="mt-1 text-[clamp(1.45rem,6vw,2.5rem)] font-black tracking-normal">
                {exercise.prompt}
              </h1>
            </div>
          </div>

          {exercise.codeSnippet && exercise.type !== "spot_bug" && (
            <CodeBlock codeSnippet={exercise.codeSnippet} />
          )}

          <ExerciseAnswer answer={answer} exercise={exercise} onChange={setAnswer} />
        </section>

        <div className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-duo-swan bg-duo-snow px-3 pb-safe pt-3 xs:px-4 xs:pt-4">
          <div className="mx-auto flex max-w-[700px] justify-end">
            <DuoButton
              className="w-full sm:w-auto sm:min-w-40"
              disabled={!hasLessonAnswer(exercise, answer) || Boolean(feedback) || checking}
              icon={
                checking ? (
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                ) : undefined
              }
              onClick={() => void checkAnswer()}
            >
              {checking ? "Checking..." : "Check"}
            </DuoButton>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {feedback && (
          <FeedbackPanel
            feedback={feedback}
            key={exercise.id}
            onContinue={continueLesson}
            xpEarned={feedback.correct ? xpPerCorrect : 0}
          />
        )}
      </AnimatePresence>

      {showExitConfirm && (
        <ExitConfirm
          onCancel={() => setShowExitConfirm(false)}
          onExit={onExit}
        />
      )}
    </main>
  );
}
