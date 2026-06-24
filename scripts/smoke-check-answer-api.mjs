const baseUrl = process.argv[2] ?? "http://127.0.0.1:3000";

async function postCheck(body) {
  const response = await fetch(`${baseUrl}/api/check-answer`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  }

  return response.json();
}

const exact = await postCheck({
  exerciseId: "js-functions-type-function",
  exercisePrompt: "Write a function named isEven that returns true when n is evenly divisible by 2.",
  exerciseType: "type_function",
  language: "JavaScript",
  correctAnswer: [
    "function isEven(n) { return n % 2 === 0; }",
    "function isEven(n){return n%2===0;}",
  ],
  userAnswer: "function isEven(n) { return n % 2 === 0; }",
});

const equivalent = await postCheck({
  exerciseId: "js-functions-type-function",
  exercisePrompt: "Write a function named isEven that returns true when n is evenly divisible by 2.",
  exerciseType: "type_function",
  language: "JavaScript",
  correctAnswer: [
    "function isEven(n) { return n % 2 === 0; }",
    "function isEven(n){return n%2===0;}",
  ],
  userAnswer: "function isEven(n) { return !(n % 2); }",
});

console.log(
  JSON.stringify(
    {
      exact,
      equivalent,
      note:
        equivalent.method === "gemini_semantic"
          ? "Gemini semantic fallback was exercised."
          : "Gemini fallback was not exercised; configure GEMINI_API_KEY to test semantic equivalence live.",
    },
    null,
    2,
  ),
);
