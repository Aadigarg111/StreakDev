import type { ProgressDocument } from "@/lib/progress";

export type Achievement = {
  id: string;
  label: string;
  description: string;
  check: (progress: ProgressDocument, context?: AchievementContext) => boolean;
};

export type AchievementContext = {
  lastLessonAccuracy?: number;
  perfect?: boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_lesson",
    label: "First Steps",
    description: "Complete your first lesson.",
    check: (progress) => progress.completedLessons.length >= 1,
  },
  {
    id: "lessons_50",
    label: "Half Century",
    description: "Complete 50 lessons.",
    check: (progress) => progress.completedLessons.length >= 50,
  },
  {
    id: "lessons_100",
    label: "Centurion",
    description: "Complete 100 lessons.",
    check: (progress) => progress.completedLessons.length >= 100,
  },
  {
    id: "streak_7",
    label: "Week Warrior",
    description: "Keep a 7 day streak.",
    check: (progress) => progress.streakDays >= 7,
  },
  {
    id: "streak_30",
    label: "Monthly Master",
    description: "Keep a 30 day streak.",
    check: (progress) => progress.streakDays >= 30,
  },
  {
    id: "streak_100",
    label: "Triple Digit",
    description: "Keep a 100 day streak.",
    check: (progress) => progress.streakDays >= 100,
  },
  {
    id: "perfect_lesson",
    label: "Flawless",
    description: "Finish a lesson without a miss.",
    check: (_progress, context) => context?.perfect === true || context?.lastLessonAccuracy === 100,
  },
];
