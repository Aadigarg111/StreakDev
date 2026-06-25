"use client";

import { useCallback, useEffect, useState } from "react";
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow";
import { PathView } from "@/components/curriculum/path-view";
import { LessonSession } from "@/components/lesson/lesson-session";
import {
  getActiveUnit,
  getLessonExercises,
  getPrimaryLesson,
  getTrack,
} from "@/lib/curriculum";
import { enterImmersiveMode } from "@/lib/immersive-mode";
import { useUserProgressStore } from "@/store/user-progress";
import type { LessonCompletionPayload, UserProgressState } from "@/store/user-progress";
import type { Exercise, Lesson } from "../../../types/content";

const liveTrackId = "html-css";

type CompletionRewards = {
  completedQuests?: Array<{ id: string; description: string; gemsReward: number }>;
  newlyUnlockedAchievements?: Array<{ id: string; label: string; description: string }>;
};

const select = <T,>(selector: (state: UserProgressState) => T) => selector;

type ActiveLesson = {
  trackId: string;
  sectionOrder: number;
  unitOrder: number;
  unitId: string;
  unitTitle: string;
  lesson: Lesson;
  exercises: Exercise[];
};

export function StreakDevApp() {
  const [activeLesson, setActiveLesson] = useState<ActiveLesson | null>(null);
  const onboardingComplete = useUserProgressStore(select((state) => state.onboardingComplete));
  const enrolledTrackIds = useUserProgressStore(select((state) => state.enrolledTrackIds));
  const currentTrackId = useUserProgressStore(select((state) => state.currentTrackId));
  const dailyGoalXp = useUserProgressStore(select((state) => state.dailyGoalXp));
  const trackProgress = useUserProgressStore(select((state) => state.trackProgress));
  const hearts = useUserProgressStore(select((state) => state.hearts));
  const maxHearts = useUserProgressStore(select((state) => state.maxHearts));
  const xp = useUserProgressStore(select((state) => state.xp));
  const streakDays = useUserProgressStore(select((state) => state.streakDays));
  const gems = useUserProgressStore(select((state) => state.gems));
  const completedUnitIds = useUserProgressStore(select((state) => state.completedUnitIds));
  const completeOnboarding = useUserProgressStore(select((state) => state.completeOnboarding));
  const switchTrack = useUserProgressStore(select((state) => state.switchTrack));
  const resetOnboarding = useUserProgressStore(select((state) => state.resetOnboarding));
  const loseHeart = useUserProgressStore(select((state) => state.loseHeart));
  const refillHearts = useUserProgressStore(select((state) => state.refillHearts));
  const completeLesson = useUserProgressStore(select((state) => state.completeLesson));
  const setProgressFromServer = useUserProgressStore(select((state) => state.setProgressFromServer));
  const getProgressSnapshot = useUserProgressStore(select((state) => state.getProgressSnapshot));

  const syncProgressFromServer = useCallback(async () => {
    try {
      const migrateResponse = await fetch("/api/progress/migrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(getProgressSnapshot()),
      });

      if (migrateResponse.ok) {
        const body = await migrateResponse.json();

        if (body.progress) {
          setProgressFromServer(body.progress);
        }
      }
    } catch {
      // Guest mode keeps working if sync is unavailable.
    }
  }, [getProgressSnapshot, setProgressFromServer]);

  useEffect(() => {
    async function loadSignedInProgress() {
      try {
        const authResponse = await fetch("/api/auth/me");
        const auth = await authResponse.json();

        if (auth.authenticated) {
          await syncProgressFromServer();
        }
      } catch {
        // Local progress is the fallback for signed-out or offline use.
      }
    }

    void loadSignedInProgress();
    window.addEventListener("streakdev-auth-changed", syncProgressFromServer);

    return () => {
      window.removeEventListener("streakdev-auth-changed", syncProgressFromServer);
    };
  }, [syncProgressFromServer]);

  async function completeLessonWithSync(payload: LessonCompletionPayload): Promise<CompletionRewards | void> {
    completeLesson(payload);

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return undefined;
      }

      const body = await response.json();

      if (body.progress) {
        setProgressFromServer(body.progress);
      }

      return {
        completedQuests: body.completedQuests ?? [],
        newlyUnlockedAchievements: body.newlyUnlockedAchievements ?? [],
      };
    } catch {
      return undefined;
    }
  }

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  const activeTrackId = currentTrackId === liveTrackId ? currentTrackId : liveTrackId;
  const visibleEnrolledTrackIds = enrolledTrackIds.includes(liveTrackId) ? [liveTrackId] : [liveTrackId];
  const track = getTrack(activeTrackId);
  const progress = trackProgress[activeTrackId] ?? {
    currentSection: 1,
    currentUnit: 1,
    completedThroughSection: 0,
    placementSource: "new" as const,
  };

  function startLesson() {
    const { section, unit } = getActiveUnit(track, progress.currentSection, progress.currentUnit);
    const lesson = getPrimaryLesson(unit);
    const exercises = getLessonExercises(lesson);

    void enterImmersiveMode();
    setActiveLesson({
      trackId: track.id,
      sectionOrder: section.order,
      unitOrder: unit.order,
      unitId: unit.id,
      unitTitle: unit.title,
      lesson,
      exercises,
    });
  }

  if (activeLesson) {
    return (
      <LessonSession
        exercises={activeLesson.exercises}
        hearts={hearts}
        lesson={activeLesson.lesson}
        maxHearts={maxHearts}
        onCompleteLesson={completeLessonWithSync}
        onExit={() => setActiveLesson(null)}
        onLoseHeart={loseHeart}
        onRefillHearts={refillHearts}
        sectionOrder={activeLesson.sectionOrder}
        trackId={activeLesson.trackId}
        unitId={activeLesson.unitId}
        unitOrder={activeLesson.unitOrder}
        unitTitle={activeLesson.unitTitle}
      />
    );
  }

  return (
    <PathView
      completedUnitIds={completedUnitIds}
      dailyGoalXp={dailyGoalXp}
      enrolledTrackIds={visibleEnrolledTrackIds}
      onReset={resetOnboarding}
      onStartLesson={startLesson}
      onSwitchTrack={(trackId) => {
        if (trackId === liveTrackId) {
          switchTrack(trackId);
        }
      }}
      progress={progress}
      stats={{
        gems,
        hearts,
        maxHearts,
        streakDays,
        xp,
      }}
      track={track}
    />
  );
}
