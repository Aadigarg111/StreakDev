import { ObjectId } from "mongodb";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { getDb } from "@/lib/db/mongo";
import { incrementWeeklyXp } from "@/lib/leagues";
import {
  ensureTodaysQuests,
  type DailyQuestsState,
  updateQuestProgress,
  getLocalDateKey,
} from "@/lib/quests";

export type TrackProgress = {
  currentSection: number;
  currentUnit: number;
  completedThroughSection: number;
  placementSource: "new" | "placement";
};

export type ProgressDocument = {
  _id?: ObjectId;
  userId: ObjectId;
  hearts: number;
  maxHearts: number;
  xp: number;
  gems: number;
  streakDays: number;
  lastStreakDate: string | null;
  dailyGoalXp: number;
  leagueId: string | null;
  enrolledTracks: string[];
  currentTrackId: string;
  completedLessons: string[];
  completedUnits: string[];
  perfectLessons: string[];
  trackProgress: Record<string, TrackProgress>;
  dailyQuests?: DailyQuestsState;
  unlockedAchievements: Array<{ id: string; unlockedAt: Date }>;
  updatedAt: Date;
};

export type ProgressCompletionPayload = {
  trackId: string;
  sectionOrder: number;
  unitOrder: number;
  lessonId: string;
  unitId: string;
  xpEarned: number;
  accuracy: number;
  perfect: boolean;
  longestCorrectStreak?: number;
};

export type ClientProgressSnapshot = {
  onboardingComplete?: boolean;
  enrolledTrackIds?: string[];
  currentTrackId?: string;
  dailyGoalXp?: number;
  hearts?: number;
  maxHearts?: number;
  xp?: number;
  weeklyXp?: number;
  streakDays?: number;
  lastActiveDate?: string | null;
  gems?: number;
  completedLessonIds?: string[];
  completedUnitIds?: string[];
  perfectLessonIds?: string[];
  trackProgress?: Record<string, TrackProgress>;
};

export function defaultTrackProgress(
  section = 1,
  placementSource: TrackProgress["placementSource"] = "new",
): TrackProgress {
  return {
    currentSection: section,
    currentUnit: 1,
    completedThroughSection: placementSource === "placement" ? Math.max(0, section - 1) : 0,
    placementSource,
  };
}

export function nextTrackProgress(
  progress: TrackProgress,
  sectionOrder: number,
  unitOrder: number,
): TrackProgress {
  if (unitOrder >= 10) {
    return {
      ...progress,
      currentSection: Math.min(sectionOrder + 1, 10),
      currentUnit: 1,
      completedThroughSection: Math.max(progress.completedThroughSection, sectionOrder),
    };
  }

  return {
    ...progress,
    currentSection: sectionOrder,
    currentUnit: unitOrder + 1,
  };
}

export function createInitialProgress(
  userId: ObjectId,
  snapshot?: ClientProgressSnapshot,
): ProgressDocument {
  return {
    userId,
    hearts: snapshot?.hearts ?? 5,
    maxHearts: snapshot?.maxHearts ?? 5,
    xp: snapshot?.xp ?? 0,
    gems: snapshot?.gems ?? 50,
    streakDays: snapshot?.streakDays ?? 0,
    lastStreakDate: snapshot?.lastActiveDate ?? null,
    dailyGoalXp: snapshot?.dailyGoalXp ?? 10,
    leagueId: null,
    enrolledTracks: snapshot?.enrolledTrackIds ?? [],
    currentTrackId: snapshot?.currentTrackId ?? "javascript",
    completedLessons: snapshot?.completedLessonIds ?? [],
    completedUnits: snapshot?.completedUnitIds ?? [],
    perfectLessons: snapshot?.perfectLessonIds ?? [],
    trackProgress: snapshot?.trackProgress ?? {},
    dailyQuests: ensureTodaysQuests(null),
    unlockedAchievements: [],
    updatedAt: new Date(),
  };
}

export async function ensureProgress(userId: ObjectId) {
  const db = await getDb();
  let progress = (await db.collection("progress").findOne({ userId })) as ProgressDocument | null;

  if (!progress) {
    const initial = createInitialProgress(userId);
    const result = await db.collection("progress").insertOne(initial);
    progress = { ...initial, _id: result.insertedId };
  }

  const dailyQuests = ensureTodaysQuests(progress.dailyQuests);

  if (dailyQuests !== progress.dailyQuests) {
    await db.collection("progress").updateOne(
      { userId },
      { $set: { dailyQuests, updatedAt: new Date() } },
    );
    progress = { ...progress, dailyQuests };
  }

  return progress;
}

export function serializeProgress(progress: ProgressDocument) {
  return {
    onboardingComplete: progress.enrolledTracks.length > 0,
    enrolledTrackIds: progress.enrolledTracks,
    currentTrackId: progress.currentTrackId,
    dailyGoalXp: progress.dailyGoalXp,
    hearts: progress.hearts,
    maxHearts: progress.maxHearts,
    xp: progress.xp,
    streakDays: progress.streakDays,
    lastActiveDate: progress.lastStreakDate,
    gems: progress.gems,
    completedLessonIds: progress.completedLessons,
    completedUnitIds: progress.completedUnits,
    perfectLessonIds: progress.perfectLessons,
    trackProgress: progress.trackProgress,
    dailyQuests: progress.dailyQuests,
    unlockedAchievements: progress.unlockedAchievements,
  };
}

export async function mergeClientProgress(userId: ObjectId, snapshot: ClientProgressSnapshot) {
  const db = await getDb();
  const current = await ensureProgress(userId);
  const merged = createInitialProgress(userId, {
    ...snapshot,
    xp: Math.max(current.xp, snapshot.xp ?? 0),
    gems: Math.max(current.gems, snapshot.gems ?? 50),
    streakDays: Math.max(current.streakDays, snapshot.streakDays ?? 0),
    enrolledTrackIds: Array.from(new Set([...current.enrolledTracks, ...(snapshot.enrolledTrackIds ?? [])])),
    completedLessonIds: Array.from(
      new Set([...current.completedLessons, ...(snapshot.completedLessonIds ?? [])]),
    ),
    completedUnitIds: Array.from(new Set([...current.completedUnits, ...(snapshot.completedUnitIds ?? [])])),
    perfectLessonIds: Array.from(new Set([...current.perfectLessons, ...(snapshot.perfectLessonIds ?? [])])),
    trackProgress: { ...snapshot.trackProgress, ...current.trackProgress },
  });
  merged._id = current._id;
  merged.dailyQuests = ensureTodaysQuests(current.dailyQuests);
  merged.unlockedAchievements = current.unlockedAchievements ?? [];

  await db.collection("progress").updateOne(
    { userId },
    {
      $set: {
        ...merged,
        updatedAt: new Date(),
      },
    },
    { upsert: true },
  );

  return ensureProgress(userId);
}

export async function applyLessonCompletion(
  user: { _id: ObjectId; displayName: string; avatarSeed: string },
  payload: ProgressCompletionPayload,
) {
  const db = await getDb();
  const current = await ensureProgress(user._id);
  const today = getLocalDateKey();
  const extendsStreak = current.lastStreakDate !== today;
  const currentTrackProgress =
    current.trackProgress[payload.trackId] ?? defaultTrackProgress(payload.sectionOrder);
  const shouldAdvance =
    currentTrackProgress.currentSection === payload.sectionOrder &&
    currentTrackProgress.currentUnit === payload.unitOrder;
  const completedLessons = current.completedLessons.includes(payload.lessonId)
    ? current.completedLessons
    : [...current.completedLessons, payload.lessonId];
  const completedUnits = current.completedUnits.includes(payload.unitId)
    ? current.completedUnits
    : [...current.completedUnits, payload.unitId];
  const perfectLessons =
    payload.perfect && !current.perfectLessons.includes(payload.lessonId)
      ? [...current.perfectLessons, payload.lessonId]
      : current.perfectLessons;
  const dailyQuestUpdate = updateQuestProgress(ensureTodaysQuests(current.dailyQuests), {
    xpEarned: payload.xpEarned,
    perfect: payload.perfect,
    longestCorrectStreak: payload.longestCorrectStreak ?? 0,
  });
  const baseGems = payload.perfect ? 8 : 4;
  const nextProgress: ProgressDocument = {
    ...current,
    xp: current.xp + payload.xpEarned,
    gems: current.gems + baseGems + dailyQuestUpdate.gemsAwarded,
    streakDays: extendsStreak ? current.streakDays + 1 : current.streakDays,
    lastStreakDate: today,
    completedLessons,
    completedUnits,
    perfectLessons,
    dailyQuests: dailyQuestUpdate.dailyQuests,
    trackProgress: {
      ...current.trackProgress,
      [payload.trackId]: shouldAdvance
        ? nextTrackProgress(currentTrackProgress, payload.sectionOrder, payload.unitOrder)
        : currentTrackProgress,
    },
    updatedAt: new Date(),
  };
  const unlockedIds = new Set(nextProgress.unlockedAchievements.map((achievement) => achievement.id));
  const newlyUnlocked = ACHIEVEMENTS.filter(
    (achievement) =>
      !unlockedIds.has(achievement.id) &&
      achievement.check(nextProgress, {
        lastLessonAccuracy: payload.accuracy,
        perfect: payload.perfect,
      }),
  ).map((achievement) => ({
    id: achievement.id,
    label: achievement.label,
    description: achievement.description,
    unlockedAt: new Date(),
  }));

  nextProgress.unlockedAchievements = [
    ...nextProgress.unlockedAchievements,
    ...newlyUnlocked.map(({ id, unlockedAt }) => ({ id, unlockedAt })),
  ];

  await db.collection("progress").updateOne(
    { userId: user._id },
    {
      $set: {
        hearts: nextProgress.hearts,
        maxHearts: nextProgress.maxHearts,
        xp: nextProgress.xp,
        gems: nextProgress.gems,
        streakDays: nextProgress.streakDays,
        lastStreakDate: nextProgress.lastStreakDate,
        completedLessons: nextProgress.completedLessons,
        completedUnits: nextProgress.completedUnits,
        perfectLessons: nextProgress.perfectLessons,
        trackProgress: nextProgress.trackProgress,
        dailyQuests: nextProgress.dailyQuests,
        unlockedAchievements: nextProgress.unlockedAchievements,
        updatedAt: nextProgress.updatedAt,
      },
    },
  );

  await incrementWeeklyXp(user, payload.xpEarned);

  return {
    progress: serializeProgress(nextProgress),
    completedQuests: dailyQuestUpdate.completedQuests,
    newlyUnlockedAchievements: newlyUnlocked,
  };
}
