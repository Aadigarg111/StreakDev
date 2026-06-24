import bigOTrack from "../../content/tracks/big-o.json";
import cTrack from "../../content/tracks/c.json";
import cppTrack from "../../content/tracks/cpp.json";
import dbmsTrack from "../../content/tracks/dbms.json";
import dsaTrack from "../../content/tracks/dsa.json";
import gitGithubTrack from "../../content/tracks/git-github.json";
import htmlCssTrack from "../../content/tracks/html-css.json";
import javaTrack from "../../content/tracks/java.json";
import javascriptTrack from "../../content/tracks/javascript.json";
import networksTrack from "../../content/tracks/networks.json";
import nodeBackendTrack from "../../content/tracks/node-backend.json";
import oodTrack from "../../content/tracks/ood.json";
import operatingSystemsTrack from "../../content/tracks/operating-systems.json";
import pythonTrack from "../../content/tracks/python.json";
import reactTrack from "../../content/tracks/react.json";
import sqlTrack from "../../content/tracks/sql.json";
import systemDesignTrack from "../../content/tracks/system-design.json";
import typescriptTrack from "../../content/tracks/typescript.json";
import placementFallback from "../../content/exercises/placement-fallback.json";
import placementQuestions from "../../content/exercises/placement.json";
import lessonJavaScriptFunctions from "../../content/exercises/lesson-javascript-functions.json";
import sampleExercises from "../../content/exercises/sample.json";
import sqlExercises from "../../content/exercises/sql.json";
import type {
  Exercise,
  Lesson,
  PlacementExercise,
  Track,
  TrackCategory,
  Unit,
} from "../../types/content";

export const categoryLabels: Record<TrackCategory, string> = {
  "web-dev": "Web Dev",
  languages: "Languages",
  "core-cs": "Core CS",
};

export const categoryOrder: TrackCategory[] = [
  "web-dev",
  "languages",
  "core-cs",
];

export const tracks = [
  htmlCssTrack,
  javascriptTrack,
  typescriptTrack,
  reactTrack,
  nodeBackendTrack,
  gitGithubTrack,
  pythonTrack,
  cTrack,
  cppTrack,
  javaTrack,
  sqlTrack,
  dsaTrack,
  bigOTrack,
  operatingSystemsTrack,
  networksTrack,
  dbmsTrack,
  oodTrack,
  systemDesignTrack,
] as Track[];

export const tracksById = Object.fromEntries(
  tracks.map((track) => [track.id, track]),
) as Record<string, Track>;

export const exerciseBank = [
  ...(sampleExercises as Exercise[]),
  ...(lessonJavaScriptFunctions as Exercise[]),
  ...(sqlExercises as Exercise[]),
] as Exercise[];

export const exercisesById = Object.fromEntries(
  exerciseBank.map((exercise) => [exercise.id, exercise]),
) as Record<string, Exercise>;

export function getTrack(trackId: string) {
  return tracksById[trackId] ?? tracks[0];
}

export function getTracksByCategory(category: TrackCategory) {
  return tracks.filter((track) => track.category === category);
}

export function getPlacementQuestions(trackId: string) {
  const directQuestions = (placementQuestions as PlacementExercise[]).filter(
    (question) => question.trackId === trackId,
  );

  if (directQuestions.length >= 2) {
    return directQuestions;
  }

  return (placementFallback as PlacementExercise[]).map((question, index) => ({
    ...question,
    id: `${trackId}-${question.id}-${index + 1}`,
    trackId,
  }));
}

export function getVisibleSections(track: Track, currentSection: number) {
  const safeSection = Math.min(Math.max(currentSection, 1), track.sections.length);
  return track.sections.slice(safeSection - 1, safeSection + 1);
}

export function getActiveUnit(track: Track, currentSection: number, currentUnit: number) {
  const section = track.sections.find((item) => item.order === currentSection) ?? track.sections[0];
  const unit = section.units.find((item) => item.order === currentUnit) ?? section.units[0];

  return { section, unit };
}

export function getPrimaryLesson(unit: Unit): Lesson {
  return unit.lessons[0];
}

export function getLessonExercises(lesson: Lesson) {
  return lesson.exerciseIds
    .map((exerciseId) => exercisesById[exerciseId])
    .filter(Boolean);
}
