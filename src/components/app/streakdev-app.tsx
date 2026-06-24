"use client";

import { useState } from "react";
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
import type { Exercise, Lesson } from "../../../types/content";

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
  const onboardingComplete = useUserProgressStore((state) => state.onboardingComplete);
  const enrolledTrackIds = useUserProgressStore((state) => state.enrolledTrackIds);
  const currentTrackId = useUserProgressStore((state) => state.currentTrackId);
  const dailyGoalXp = useUserProgressStore((state) => state.dailyGoalXp);
  const trackProgress = useUserProgressStore((state) => state.trackProgress);
  const hearts = useUserProgressStore((state) => state.hearts);
  const maxHearts = useUserProgressStore((state) => state.maxHearts);
  const xp = useUserProgressStore((state) => state.xp);
  const streakDays = useUserProgressStore((state) => state.streakDays);
  const gems = useUserProgressStore((state) => state.gems);
  const completedUnitIds = useUserProgressStore((state) => state.completedUnitIds);
  const completeOnboarding = useUserProgressStore((state) => state.completeOnboarding);
  const switchTrack = useUserProgressStore((state) => state.switchTrack);
  const resetOnboarding = useUserProgressStore((state) => state.resetOnboarding);
  const loseHeart = useUserProgressStore((state) => state.loseHeart);
  const refillHearts = useUserProgressStore((state) => state.refillHearts);
  const completeLesson = useUserProgressStore((state) => state.completeLesson);

  if (!onboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  const track = getTrack(currentTrackId);
  const progress = trackProgress[currentTrackId] ?? {
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
        onCompleteLesson={completeLesson}
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
      enrolledTrackIds={enrolledTrackIds}
      onReset={resetOnboarding}
      onStartLesson={startLesson}
      onSwitchTrack={switchTrack}
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
