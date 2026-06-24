export function normalizeCodeAnswer(value: string) {
  return value
    .replace(/\s+/g, "")
    .replace(/;}/g, "}")
    .trim()
    .toLowerCase();
}

export function normalizeTextAnswer(value: string) {
  return value.trim().toLowerCase();
}

export function normalizedAnswerMatch(
  userAnswer: string,
  correctAnswer: string | string[],
  mode: "code" | "text" = "text",
) {
  const normalize = mode === "code" ? normalizeCodeAnswer : normalizeTextAnswer;
  const acceptedAnswers = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

  return acceptedAnswers.some((acceptedAnswer) => {
    return normalize(userAnswer) === normalize(acceptedAnswer);
  });
}
