import type { PlacementExercise } from "../../types/content";

export type PlacementAnswer = {
  question: PlacementExercise;
  correct: boolean;
};

export function isAnswerCorrect(
  question: PlacementExercise,
  answer: string | string[],
) {
  if (Array.isArray(question.correctAnswer)) {
    const submitted = Array.isArray(answer) ? answer : [answer];
    return (
      submitted.length === question.correctAnswer.length &&
      submitted.every((value, index) => {
        return value.trim().toLowerCase() === question.correctAnswer[index].trim().toLowerCase();
      })
    );
  }

  if (Array.isArray(answer)) {
    return false;
  }

  return answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase();
}

export function shouldStopPlacement(answers: PlacementAnswer[]) {
  if (answers.length >= 10) {
    return true;
  }

  const lastTwo = answers.slice(-2);
  return lastTwo.length === 2 && lastTwo.every((answer) => !answer.correct);
}

export function calculatePlacementSection(answers: PlacementAnswer[]) {
  if (answers.length === 0) {
    return 1;
  }

  const correctAnswers = answers.filter((answer) => answer.correct);
  const highestCorrectSection = correctAnswers.reduce(
    (highest, answer) => Math.max(highest, answer.question.sectionOrder),
    1,
  );
  const accuracy = correctAnswers.length / answers.length;

  if (accuracy >= 0.9 && highestCorrectSection >= 8) {
    return Math.min(10, highestCorrectSection);
  }

  if (accuracy >= 0.75) {
    return Math.min(10, highestCorrectSection + 1);
  }

  if (accuracy >= 0.5) {
    return Math.max(2, highestCorrectSection);
  }

  return Math.max(1, highestCorrectSection - 1);
}
