import type { Exercise } from "../../types/content";
import { normalizedAnswerMatch } from "@/lib/answer-normalization";

export type LessonAnswer = string | string[];

export function hasLessonAnswer(exercise: Exercise, answer: LessonAnswer) {
  if (exercise.type === "drag_reorder") {
    return Array.isArray(answer) && answer.length > 0;
  }

  if (Array.isArray(answer)) {
    return answer.length > 0;
  }

  return answer.trim().length > 0;
}

export function isLessonAnswerCorrect(exercise: Exercise, answer: LessonAnswer) {
  if (exercise.type === "drag_reorder") {
    return (
      Array.isArray(answer) &&
      Array.isArray(exercise.correctAnswer) &&
      answer.length === exercise.correctAnswer.length &&
      answer.every((value, index) => value === exercise.correctAnswer[index])
    );
  }

  if (exercise.type === "type_function") {
    if (Array.isArray(answer)) {
      return false;
    }

    return normalizedAnswerMatch(answer, exercise.correctAnswer, "code");
  }

  if (Array.isArray(answer)) {
    return false;
  }

  if (Array.isArray(exercise.correctAnswer)) {
    return normalizedAnswerMatch(answer, exercise.correctAnswer, "text");
  }

  if (exercise.type === "fill_blank") {
    return normalizedAnswerMatch(answer, exercise.correctAnswer, "text");
  }

  return answer === exercise.correctAnswer;
}

export function formatCorrectAnswer(exercise: Exercise) {
  if (Array.isArray(exercise.correctAnswer)) {
    return exercise.correctAnswer.join("\n");
  }

  if (exercise.type === "spot_bug" && exercise.correctAnswer.startsWith("line-")) {
    return `Line ${exercise.correctAnswer.replace("line-", "")}`;
  }

  return exercise.correctAnswer;
}
