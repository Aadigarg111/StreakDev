"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

const liveTrackId = "html-css";

export type DailyGoalId = "casual" | "regular" | "serious" | "intense";

export type TrackProgress = {
  currentSection: number;
  currentUnit: number;
  completedThroughSection: number;
  placementSource: "new" | "placement";
};

export type LessonCompletionPayload = {
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

export type UserProgressState = {
  onboardingComplete: boolean;
  enrolledTrackIds: string[];
  currentTrackId: string;
  dailyGoal: DailyGoalId;
  dailyGoalXp: number;
  hearts: number;
  maxHearts: number;
  xp: number;
  weeklyXp: number;
  streakDays: number;
  lastActiveDate: string | null;
  gems: number;
  completedLessonIds: string[];
  completedUnitIds: string[];
  perfectLessonIds: string[];
  trackProgress: Record<string, TrackProgress>;
  setProgressFromServer: (payload: Partial<UserProgressState>) => void;
  getProgressSnapshot: () => ClientProgressSnapshot;
  completeOnboarding: (payload: {
    trackIds: string[];
    dailyGoal: DailyGoalId;
    dailyGoalXp: number;
    primaryTrackId: string;
    placementSection: number;
    placementSource: TrackProgress["placementSource"];
  }) => void;
  switchTrack: (trackId: string) => void;
  loseHeart: () => number;
  refillHearts: (mode: "practice" | "gems") => void;
  completeLesson: (payload: LessonCompletionPayload) => void;
  resetOnboarding: () => void;
};

export type ClientProgressSnapshot = {
  onboardingComplete: boolean;
  enrolledTrackIds: string[];
  currentTrackId: string;
  dailyGoalXp: number;
  hearts: number;
  maxHearts: number;
  xp: number;
  weeklyXp: number;
  streakDays: number;
  lastActiveDate: string | null;
  gems: number;
  completedLessonIds: string[];
  completedUnitIds: string[];
  perfectLessonIds: string[];
  trackProgress: Record<string, TrackProgress>;
};

function defaultTrackProgress(
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

function getLocalDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function nextTrackProgress(
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

export const useUserProgressStore = create<UserProgressState>()(
  persist<UserProgressState>(
    (set, get) => ({
      onboardingComplete: false,
      enrolledTrackIds: [],
      currentTrackId: liveTrackId,
      dailyGoal: "regular",
      dailyGoalXp: 10,
      hearts: 5,
      maxHearts: 5,
      xp: 0,
      weeklyXp: 0,
      streakDays: 0,
      lastActiveDate: null,
      gems: 50,
      completedLessonIds: [],
      completedUnitIds: [],
      perfectLessonIds: [],
      trackProgress: {},
      setProgressFromServer: (payload) =>
        set((state) => ({
          ...state,
          onboardingComplete: payload.onboardingComplete ?? state.onboardingComplete,
          enrolledTrackIds: [liveTrackId],
          currentTrackId: liveTrackId,
          dailyGoalXp: payload.dailyGoalXp ?? state.dailyGoalXp,
          hearts: payload.hearts ?? state.hearts,
          maxHearts: payload.maxHearts ?? state.maxHearts,
          xp: payload.xp ?? state.xp,
          weeklyXp: payload.weeklyXp ?? state.weeklyXp,
          streakDays: payload.streakDays ?? state.streakDays,
          lastActiveDate: payload.lastActiveDate ?? state.lastActiveDate,
          gems: payload.gems ?? state.gems,
          completedLessonIds: payload.completedLessonIds ?? state.completedLessonIds,
          completedUnitIds: payload.completedUnitIds ?? state.completedUnitIds,
          perfectLessonIds: payload.perfectLessonIds ?? state.perfectLessonIds,
          trackProgress: payload.trackProgress ?? state.trackProgress,
        })),
      getProgressSnapshot: () => {
        const state = get();

        return {
          onboardingComplete: state.onboardingComplete,
          enrolledTrackIds: state.enrolledTrackIds,
          currentTrackId: state.currentTrackId,
          dailyGoalXp: state.dailyGoalXp,
          hearts: state.hearts,
          maxHearts: state.maxHearts,
          xp: state.xp,
          weeklyXp: state.weeklyXp,
          streakDays: state.streakDays,
          lastActiveDate: state.lastActiveDate,
          gems: state.gems,
          completedLessonIds: state.completedLessonIds,
          completedUnitIds: state.completedUnitIds,
          perfectLessonIds: state.perfectLessonIds,
          trackProgress: state.trackProgress,
        };
      },
      completeOnboarding: ({
        trackIds,
        dailyGoal,
        dailyGoalXp,
        primaryTrackId,
        placementSection,
        placementSource,
      }) =>
        set(() => {
          const liveTrackIds = trackIds.includes(liveTrackId) ? [liveTrackId] : [liveTrackId];
          const livePrimaryTrackId = primaryTrackId === liveTrackId ? primaryTrackId : liveTrackId;
          const trackProgress = Object.fromEntries(
            liveTrackIds.map((trackId) => [
              trackId,
              defaultTrackProgress(
                trackId === livePrimaryTrackId ? placementSection : 1,
                trackId === livePrimaryTrackId ? placementSource : "new",
              ),
            ]),
          );

          return {
            onboardingComplete: true,
            enrolledTrackIds: liveTrackIds,
            currentTrackId: livePrimaryTrackId,
            dailyGoal,
            dailyGoalXp,
            hearts: 5,
            maxHearts: 5,
            xp: 0,
            weeklyXp: 0,
            streakDays: 0,
            lastActiveDate: null,
            gems: 50,
            completedLessonIds: [],
            completedUnitIds: [],
            perfectLessonIds: [],
            trackProgress,
          };
        }),
      switchTrack: (trackId) =>
        set((state) => {
          if (trackId !== liveTrackId || !state.enrolledTrackIds.includes(trackId)) {
            return state;
          }

          return { currentTrackId: trackId };
        }),
      loseHeart: () => {
        let nextHearts = 0;
        set((state) => {
          nextHearts = Math.max(0, state.hearts - 1);
          return { hearts: nextHearts };
        });
        return nextHearts;
      },
      refillHearts: (mode) =>
        set((state) => {
          if (mode === "gems" && state.gems < 50) {
            return state;
          }

          return {
            hearts: mode === "practice" ? Math.min(state.maxHearts, Math.max(1, state.hearts + 1)) : state.maxHearts,
            gems: mode === "gems" ? state.gems - 50 : state.gems,
          };
        }),
      completeLesson: ({
        trackId,
        sectionOrder,
        unitOrder,
        lessonId,
        unitId,
        xpEarned,
        perfect,
      }) =>
        set((state) => {
          const today = getLocalDateKey();
          const extendsStreak = state.lastActiveDate !== today;
          const currentProgress =
            state.trackProgress[trackId] ?? defaultTrackProgress(sectionOrder);
          const shouldAdvance =
            currentProgress.currentSection === sectionOrder &&
            currentProgress.currentUnit === unitOrder;

          return {
            xp: state.xp + xpEarned,
            weeklyXp: state.weeklyXp + xpEarned,
            gems: state.gems + (perfect ? 8 : 4),
            streakDays: extendsStreak ? state.streakDays + 1 : state.streakDays,
            lastActiveDate: today,
            completedLessonIds: state.completedLessonIds.includes(lessonId)
              ? state.completedLessonIds
              : [...state.completedLessonIds, lessonId],
            completedUnitIds: state.completedUnitIds.includes(unitId)
              ? state.completedUnitIds
              : [...state.completedUnitIds, unitId],
            perfectLessonIds:
              perfect && !state.perfectLessonIds.includes(lessonId)
                ? [...state.perfectLessonIds, lessonId]
                : state.perfectLessonIds,
            trackProgress: {
              ...state.trackProgress,
              [trackId]: shouldAdvance
                ? nextTrackProgress(currentProgress, sectionOrder, unitOrder)
                : currentProgress,
            },
          };
        }),
      resetOnboarding: () =>
        set({
          onboardingComplete: false,
          enrolledTrackIds: [],
          currentTrackId: liveTrackId,
          dailyGoal: "regular",
          dailyGoalXp: 10,
          hearts: 5,
          maxHearts: 5,
          xp: 0,
          weeklyXp: 0,
          streakDays: 0,
          lastActiveDate: null,
          gems: 50,
          completedLessonIds: [],
          completedUnitIds: [],
          perfectLessonIds: [],
          trackProgress: {},
        }),
    }),
    {
      name: "streakdev-progress-v1",
    },
  ),
);
