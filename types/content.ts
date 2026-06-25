export type TrackCategory = "web-dev" | "languages" | "core-cs";

export type ExerciseType =
  | "multiple_choice"
  | "fill_blank"
  | "spot_bug"
  | "predict_output"
  | "drag_reorder"
  | "type_function";

export type Difficulty = "easy" | "medium" | "hard";

export type Track = {
  id: string;
  title: string;
  category: TrackCategory;
  icon: string;
  color: string;
  description: string;
  sections: Section[];
};

export type Section = {
  id: string;
  trackId: string;
  order: number;
  title: string;
  bannerColor: string;
  units: Unit[];
};

export type Unit = {
  id: string;
  sectionId: string;
  order: number;
  title: string;
  learn?: string;
  lessons: Lesson[];
};

export type Lesson = {
  id: string;
  unitId: string;
  title: string;
  order: number;
  exerciseIds: string[];
};

export type Exercise = {
  id: string;
  type: ExerciseType;
  prompt: string;
  codeSnippet?: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
  difficulty: Difficulty;
};

export type PlacementExercise = Exercise & {
  trackId: string;
  sectionOrder: number;
};
