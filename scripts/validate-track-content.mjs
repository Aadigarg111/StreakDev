import fs from "node:fs";
import path from "node:path";

const trackId = process.argv[2];

if (!trackId) {
  console.error("Usage: node scripts/validate-track-content.mjs <track-id>");
  process.exit(1);
}

const root = process.cwd();
const trackPath = path.join(root, "content", "tracks", `${trackId}.json`);
const exercisesPath = path.join(root, "content", "exercises", `${trackId}.json`);
const validTypes = new Set([
  "multiple_choice",
  "fill_blank",
  "spot_bug",
  "predict_output",
  "drag_reorder",
  "type_function",
]);
const validDifficulties = new Set(["easy", "medium", "hard"]);
const codeContextTypes = new Set([
  "fill_blank",
  "spot_bug",
  "predict_output",
  "drag_reorder",
  "type_function",
]);
const suspiciousSqlPatterns = [
  /;\s+(WHERE|GROUP BY|HAVING|ORDER BY|LIMIT)\b/i,
  /\bWHERE\s+\w+_id\s+EXISTS\s*\(/i,
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function answerValues(value) {
  return Array.isArray(value) ? value : [value];
}

const failures = [];
const track = readJson(trackPath);
const exercises = readJson(exercisesPath);
const exerciseIds = new Set();
const exercisesById = new Map();

if (!Array.isArray(exercises)) {
  failures.push(`${exercisesPath} must contain an Exercise[] array.`);
} else {
  for (const exercise of exercises) {
    if (!isNonEmptyString(exercise.id)) {
      failures.push("Exercise has missing id.");
      continue;
    }

    if (exerciseIds.has(exercise.id)) {
      failures.push(`Duplicate exercise id: ${exercise.id}`);
    }

    exerciseIds.add(exercise.id);
    exercisesById.set(exercise.id, exercise);

    if (!validTypes.has(exercise.type)) {
      failures.push(`${exercise.id}: invalid type ${exercise.type}`);
    }

    if (!validDifficulties.has(exercise.difficulty)) {
      failures.push(`${exercise.id}: invalid difficulty ${exercise.difficulty}`);
    }

    if (!isNonEmptyString(exercise.prompt)) {
      failures.push(`${exercise.id}: missing prompt`);
    }

    if (!isNonEmptyString(exercise.explanation)) {
      failures.push(`${exercise.id}: missing explanation`);
    }

    const answers = answerValues(exercise.correctAnswer);
    if (
      answers.length === 0 ||
      answers.some((answer) => !isNonEmptyString(answer))
    ) {
      failures.push(`${exercise.id}: missing correctAnswer`);
    }

    if (
      (exercise.type === "multiple_choice" ||
        exercise.type === "predict_output") &&
      (!Array.isArray(exercise.options) || exercise.options.length < 2)
    ) {
      failures.push(`${exercise.id}: options must contain at least two choices`);
    }

    if (
      (exercise.type === "multiple_choice" ||
        exercise.type === "predict_output") &&
      Array.isArray(exercise.options)
    ) {
      for (const answer of answers) {
        if (!exercise.options.includes(answer)) {
          failures.push(
            `${exercise.id}: correctAnswer "${answer}" is not present in options`,
          );
        }
      }
    }

    if (
      exercise.type === "drag_reorder" &&
      (!Array.isArray(exercise.options) || !Array.isArray(exercise.correctAnswer))
    ) {
      failures.push(`${exercise.id}: drag_reorder needs options and correctAnswer arrays`);
    }

    if (codeContextTypes.has(exercise.type) && !isNonEmptyString(exercise.codeSnippet)) {
      failures.push(`${exercise.id}: ${exercise.type} requires a codeSnippet`);
    }

    const sqlLikeValues = [
      exercise.codeSnippet,
      ...(exercise.type === "type_function" ? answers : []),
    ];

    for (const value of sqlLikeValues) {
      if (!isNonEmptyString(value)) {
        continue;
      }

      for (const pattern of suspiciousSqlPatterns) {
        if (pattern.test(value)) {
          failures.push(
            `${exercise.id}: suspicious SQL clause ordering in "${value
              .replace(/\s+/g, " ")
              .slice(0, 120)}"`,
          );
        }
      }
    }
  }
}

const referencedIds = [];
for (const section of track.sections ?? []) {
  for (const unit of section.units ?? []) {
    const lesson = unit.lessons?.[0];
    const ids = lesson?.exerciseIds ?? [];

    if (ids.length !== 8) {
      failures.push(`${unit.id}: first lesson should reference exactly 8 exercises`);
    }

    for (const id of ids) {
      referencedIds.push(id);
      if (!exercisesById.has(id)) {
        failures.push(`${unit.id}: references missing exercise ${id}`);
      }
    }
  }
}

const duplicateReferences = referencedIds.filter((id, index) => {
  return referencedIds.indexOf(id) !== index;
});
if (duplicateReferences.length > 0) {
  failures.push(`Duplicate track exercise references: ${[...new Set(duplicateReferences)].join(", ")}`);
}

if (referencedIds.length !== exercises.length) {
  failures.push(
    `Referenced ${referencedIds.length} exercises, but ${exercises.length} exercises exist in ${trackId}.json`,
  );
}

if (failures.length > 0) {
  console.error(`Validation failed for ${trackId}:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(
  `Validated ${trackId}: ${track.sections.length} sections, ${referencedIds.length} exercises, ${exerciseIds.size} unique ids.`,
);
