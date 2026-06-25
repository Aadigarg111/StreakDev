"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Bell, Check, ChevronRight, Flame, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import type { DailyGoalId, TrackProgress } from "@/store/user-progress";
import type { PlacementExercise } from "../../../types/content";
import { Bity } from "@/components/mascot/bity";
import { TrackGrid } from "@/components/curriculum/track-grid";
import { DuoButton } from "@/components/ui/duo-button";
import { categoryLabels, getPlacementQuestions, getTrack } from "@/lib/curriculum";
import { playFeedback } from "@/lib/feedback-effects";
import {
  calculatePlacementSection,
  isAnswerCorrect,
  shouldStopPlacement,
  type PlacementAnswer,
} from "@/lib/placement";
import { cn } from "@/lib/cn";

const liveTrackId = "html-css";

type OnboardingStep =
  | "tracks"
  | "goal"
  | "experience"
  | "transition"
  | "quiz"
  | "result"
  | "streak";

type OnboardingFlowProps = {
  onComplete: (payload: {
    trackIds: string[];
    dailyGoal: DailyGoalId;
    dailyGoalXp: number;
    primaryTrackId: string;
    placementSection: number;
    placementSource: TrackProgress["placementSource"];
  }) => void;
};

const dailyGoals: Array<{
  id: DailyGoalId;
  title: string;
  xp: number;
  description: string;
}> = [
  {
    id: "casual",
    title: "Casual",
    xp: 5,
    description: "A tiny daily warm-up.",
  },
  {
    id: "regular",
    title: "Regular",
    xp: 10,
    description: "Steady practice without pressure.",
  },
  {
    id: "serious",
    title: "Serious",
    xp: 20,
    description: "A focused daily coding habit.",
  },
  {
    id: "intense",
    title: "Intense",
    xp: 30,
    description: "Push hard and climb fast.",
  },
];

function ScreenShell({
  children,
  stepLabel,
}: {
  children: React.ReactNode;
  stepLabel: string;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.section
      animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
      className="mx-auto flex min-h-dvh w-full max-w-5xl flex-col px-3 py-5 xs:px-4 sm:px-6 sm:py-6"
      exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
      initial={reducedMotion ? undefined : { opacity: 0, y: 12 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="mb-5 flex items-center justify-between gap-3 border-b-2 border-duo-swan pb-4">
        <div className="text-2xl font-black text-duo-green">StreakDev</div>
        <div className="rounded-full bg-duo-grey-panel px-3 py-1 text-xs font-black text-duo-grey-disabled">
          {stepLabel}
        </div>
      </div>
      {children}
    </motion.section>
  );
}

function FeedbackPanel({
  answer,
  question,
  onContinue,
}: {
  answer: PlacementAnswer;
  question: PlacementExercise;
  onContinue: () => void;
}) {
  return (
    <motion.div
      animate={{ y: 0 }}
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t-2 px-4 pb-safe pt-4 shadow-2xl sm:px-5 sm:pt-5",
        answer.correct
          ? "border-duo-green bg-[#D7FFB8]"
          : "border-duo-red bg-[#FFD9D9]",
      )}
      initial={{ y: 180 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p
            className={cn(
              "text-xl font-black",
              answer.correct ? "text-duo-green-dark" : "text-duo-red-dark",
            )}
          >
            {answer.correct ? "Nailed it!" : "Not quite"}
          </p>
          <p className="mt-1 text-sm font-bold text-duo-eel">
            {question.explanation}
          </p>
        </div>
        <DuoButton
          className="w-full sm:min-w-44"
          onClick={onContinue}
          variant={answer.correct ? "green" : "red"}
        >
          Continue
        </DuoButton>
      </div>
    </motion.div>
  );
}

function PlacementQuestionCard({
  question,
  index,
  total,
  onAnswer,
}: {
  question: PlacementExercise;
  index: number;
  total: number;
  onAnswer: (answer: PlacementAnswer) => void;
}) {
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [submittedAnswer, setSubmittedAnswer] = useState<PlacementAnswer | null>(null);
  const answer = question.type === "fill_blank" ? typedAnswer : selectedAnswer;
  const canCheck = answer.trim().length > 0 && !submittedAnswer;

  function submitAnswer() {
    const correct = isAnswerCorrect(question, answer);
    const placementAnswer = { question, correct };
    setSubmittedAnswer(placementAnswer);
    playFeedback(correct ? "correct" : "wrong");
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <div className="mb-5 h-4 overflow-hidden rounded-full bg-duo-swan">
        <motion.div
          animate={{ width: `${((index + 1) / total) * 100}%` }}
          className="h-full rounded-full bg-gradient-to-r from-duo-green to-duo-blue"
          transition={{ type: "spring", stiffness: 300, damping: 24 }}
        />
      </div>

      <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5">
        <div className="flex items-start gap-4">
          <Bity
            className="hidden h-24 w-24 sm:block"
            pose={submittedAnswer?.correct ? "celebrating" : submittedAnswer ? "sad" : "confident"}
          />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-black text-duo-grey-disabled">
              Level check {index + 1} of {total}
            </p>
            <h1 className="mt-1 text-[clamp(1.5rem,5vw,2rem)] font-black tracking-normal">
              {question.prompt}
            </h1>
            {question.codeSnippet && (
              <pre className="mt-4 overflow-x-auto rounded-duo border-2 border-duo-swan bg-duo-grey-panel p-4 text-sm font-bold leading-6 text-duo-eel">
                <code>{question.codeSnippet}</code>
              </pre>
            )}
          </div>
        </div>

        {question.type === "fill_blank" ? (
          <label className="mt-5 block">
            <span className="text-sm font-black text-duo-grey-text">Your answer</span>
            <input
              className="mt-2 h-14 w-full rounded-duo border-2 border-duo-swan px-4 text-lg font-black text-duo-eel outline-none focus:border-duo-blue focus:ring-4 focus:ring-duo-blue/20"
              disabled={Boolean(submittedAnswer)}
              onChange={(event) => setTypedAnswer(event.target.value)}
              value={typedAnswer}
            />
          </label>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {(question.options ?? []).map((option) => (
              <button
                className={cn(
                  "touch-target no-select-interactive min-h-16 rounded-duo border-2 bg-duo-snow p-4 text-left font-black text-duo-eel transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
                  selectedAnswer === option
                    ? "border-duo-green bg-[#F1FFE8]"
                    : "border-duo-swan hover:border-duo-green",
                  submittedAnswer && option === question.correctAnswer && "border-duo-green bg-[#F1FFE8]",
                )}
                disabled={Boolean(submittedAnswer)}
                key={option}
                onClick={() => {
                  setSelectedAnswer(option);
                  playFeedback("tap");
                }}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t-2 border-duo-swan bg-duo-snow p-4 pb-safe">
        <div className="mx-auto flex max-w-3xl justify-end">
          <DuoButton className="w-full sm:w-auto sm:min-w-40" disabled={!canCheck} onClick={submitAnswer}>
            Check
          </DuoButton>
        </div>
      </div>

      {submittedAnswer && (
        <FeedbackPanel
          answer={submittedAnswer}
          onContinue={() => onAnswer(submittedAnswer)}
          question={question}
        />
      )}
    </div>
  );
}

function ConfettiBurst() {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return null;
  }

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 22 }).map((_, index) => (
        <motion.span
          animate={{
            opacity: [0, 1, 0],
            rotate: [0, 160],
            x: [0, (index % 2 === 0 ? 1 : -1) * (80 + index * 4)],
            y: [0, 140 + index * 5],
          }}
          className="absolute left-1/2 top-16 h-3 w-2 rounded-sm"
          initial={{ opacity: 0 }}
          key={index}
          style={{
            backgroundColor: ["#58CC02", "#1CB0F6", "#FFC800", "#CE82FF", "#FF4B4B"][index % 5],
          }}
          transition={{ delay: index * 0.025, duration: 1.15, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("tracks");
  const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([liveTrackId]);
  const [dailyGoal, setDailyGoal] = useState<(typeof dailyGoals)[number]>(dailyGoals[1]);
  const [placementAnswers, setPlacementAnswers] = useState<PlacementAnswer[]>([]);
  const [placementSection, setPlacementSection] = useState(1);
  const [placementSource, setPlacementSource] =
    useState<TrackProgress["placementSource"]>("new");
  const primaryTrackId = selectedTrackIds[0] ?? liveTrackId;
  const primaryTrack = getTrack(primaryTrackId);
  const questions = useMemo(
    () => getPlacementQuestions(primaryTrackId).slice(0, 10),
    [primaryTrackId],
  );
  const currentQuestion = questions[placementAnswers.length];

  function toggleTrack(trackId: string) {
    if (trackId !== liveTrackId) {
      return;
    }

    setSelectedTrackIds((current) => {
      if (current.includes(trackId)) {
        return current.length === 1
          ? current
          : current.filter((id) => id !== trackId);
      }

      return [...current, trackId];
    });
    playFeedback("tap");
  }

  function startAsNew() {
    setPlacementSource("new");
    setPlacementSection(1);
    playFeedback("tap");
    setStep("streak");
  }

  function startPlacement() {
    setPlacementAnswers([]);
    setPlacementSource("placement");
    playFeedback("tap");
    setStep("transition");
  }

  function receivePlacementAnswer(answer: PlacementAnswer) {
    const nextAnswers = [...placementAnswers, answer];
    setPlacementAnswers(nextAnswers);

    if (shouldStopPlacement(nextAnswers) || nextAnswers.length >= questions.length) {
      const section = calculatePlacementSection(nextAnswers);
      setPlacementSection(section);
      playFeedback("complete");
      setStep("result");
      return;
    }
  }

  async function finishOnboarding(requestNotifications: boolean) {
    if (
      requestNotifications &&
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      await Notification.requestPermission();
    }

    playFeedback("streak");
    onComplete({
      trackIds: selectedTrackIds,
      dailyGoal: dailyGoal.id,
      dailyGoalXp: dailyGoal.xp,
      primaryTrackId,
      placementSection,
      placementSource,
    });
  }

  return (
    <main className="min-h-dvh bg-duo-grey-bg text-duo-eel">
      <AnimatePresence mode="wait">
        {step === "tracks" && (
          <ScreenShell key="tracks" stepLabel="Step 1 of 4">
            <div className="mb-6 flex flex-col items-center gap-4 text-center">
              <Bity pose="greeting" />
              <div>
                <h1 className="text-[clamp(1.875rem,8vw,3rem)] font-black tracking-normal">
                  What do you want to learn?
                </h1>
                <p className="mx-auto mt-3 max-w-2xl text-lg font-bold text-duo-grey-text">
                  Pick one track or stack a few together. Your first path starts with the first selected track.
                </p>
              </div>
            </div>
            <TrackGrid selectedTrackIds={selectedTrackIds} onToggleTrack={toggleTrack} />
            <div className="sticky bottom-0 -mx-3 mt-6 border-t-2 border-duo-swan bg-duo-snow p-4 pb-safe xs:-mx-4 sm:-mx-6">
              <div className="mx-auto flex max-w-5xl justify-end">
                <DuoButton
                  className="w-full sm:w-auto"
                  disabled={selectedTrackIds.length === 0}
                  icon={<ChevronRight className="h-5 w-5" />}
                  onClick={() => {
                    playFeedback("tap");
                    setStep("goal");
                  }}
                >
                  Continue
                </DuoButton>
              </div>
            </div>
          </ScreenShell>
        )}

        {step === "goal" && (
          <ScreenShell key="goal" stepLabel="Step 2 of 4">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center">
              <div className="mb-8 flex flex-col items-center text-center">
                <Bity pose="confident" />
                <h1 className="text-[clamp(1.875rem,8vw,3rem)] font-black tracking-normal">
                  How much time do you want to spend per day?
                </h1>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {dailyGoals.map((goal) => (
                  <button
                    aria-pressed={dailyGoal.id === goal.id}
                    className={cn(
                      "touch-target no-select-interactive flex min-h-28 items-center justify-between gap-4 rounded-duo-lg border-2 bg-duo-snow p-5 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
                      dailyGoal.id === goal.id
                        ? "border-duo-green bg-[#F1FFE8]"
                        : "border-duo-swan hover:border-duo-green",
                    )}
                    key={goal.id}
                    onClick={() => {
                      setDailyGoal(goal);
                      playFeedback("tap");
                    }}
                    type="button"
                  >
                    <span>
                      <span className="block text-xl font-black">{goal.title}</span>
                      <span className="mt-1 block text-sm font-bold text-duo-grey-text">
                        {goal.description}
                      </span>
                    </span>
                    <span className="flex items-center gap-2 rounded-full bg-duo-yellow px-3 py-1 text-sm font-black">
                      {dailyGoal.id === goal.id && <Check className="h-4 w-4" />}
                      {goal.xp} XP/day
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-6 flex justify-end">
                <DuoButton
                  className="w-full sm:w-auto"
                  icon={<ChevronRight className="h-5 w-5" />}
                  onClick={() => {
                    playFeedback("tap");
                    setStep("experience");
                  }}
                >
                  Continue
                </DuoButton>
              </div>
            </div>
          </ScreenShell>
        )}

        {step === "experience" && (
          <ScreenShell key="experience" stepLabel="Step 3 of 4">
            <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center text-center">
              <Bity className="mx-auto" pose="idle" />
              <p className="text-sm font-black text-duo-green">
                {categoryLabels[primaryTrack.category]}
              </p>
              <h1 className="mt-2 text-[clamp(1.875rem,8vw,3rem)] font-black tracking-normal">
                Have you learned {primaryTrack.title} before?
              </h1>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <button
                  className="touch-target no-select-interactive rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-6 text-left transition hover:border-duo-green focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25"
                  onClick={startAsNew}
                  type="button"
                >
                  <span className="block text-2xl font-black">I&apos;m new to this</span>
                  <span className="mt-2 block text-sm font-bold leading-5 text-duo-grey-text">
                    Start from Section 1, Unit 1 and build the foundation.
                  </span>
                </button>
                <button
                  className="touch-target no-select-interactive rounded-duo-lg border-2 border-duo-green bg-[#F1FFE8] p-6 text-left transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25"
                  onClick={startPlacement}
                  type="button"
                >
                  <span className="block text-2xl font-black">I know some of this</span>
                  <span className="mt-2 block text-sm font-bold leading-5 text-duo-grey-text">
                    Take a short level check and jump to the right section.
                  </span>
                </button>
              </div>
            </div>
          </ScreenShell>
        )}

        {step === "transition" && (
          <ScreenShell key="transition" stepLabel="Level check">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
              <Bity pose="confident" />
              <h1 className="mt-4 text-[clamp(1.875rem,8vw,3rem)] font-black tracking-normal">
                Let&apos;s see what you already know
              </h1>
              <p className="mt-3 text-lg font-bold text-duo-grey-text">
                No hearts here. Just quick questions to find your starting point.
              </p>
              <DuoButton
                className="mt-7"
                icon={<Sparkles className="h-5 w-5" />}
                onClick={() => {
                  playFeedback("tap");
                  setStep("quiz");
                }}
              >
                Start check
              </DuoButton>
            </div>
          </ScreenShell>
        )}

        {step === "quiz" && currentQuestion && (
          <ScreenShell key={`quiz-${currentQuestion.id}`} stepLabel="Level check">
            <PlacementQuestionCard
              index={placementAnswers.length}
              onAnswer={receivePlacementAnswer}
              question={currentQuestion}
              total={questions.length}
            />
          </ScreenShell>
        )}

        {step === "result" && (
          <ScreenShell key="result" stepLabel="Result">
            <div className="relative mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center overflow-hidden text-center">
              <ConfettiBurst />
              <Bity pose="celebrating" />
              <h1 className="mt-4 text-[clamp(1.875rem,8vw,3rem)] font-black tracking-normal">
                You&apos;re ready for Section {placementSection}!
              </h1>
              <p className="mt-3 text-lg font-bold text-duo-grey-text">
                Earlier sections will show as completed by level check.
              </p>
              <div className="mt-7 h-5 w-full max-w-md overflow-hidden rounded-full bg-duo-swan">
                <motion.div
                  animate={{ width: `${placementSection * 10}%` }}
                  className="h-full rounded-full bg-gradient-to-r from-duo-green to-duo-blue"
                  initial={{ width: "0%" }}
                  transition={{ type: "spring", stiffness: 180, damping: 20 }}
                />
              </div>
              <DuoButton
                className="mt-7"
                onClick={() => {
                  playFeedback("tap");
                  setStep("streak");
                }}
              >
                Continue
              </DuoButton>
            </div>
          </ScreenShell>
        )}

        {step === "streak" && (
          <ScreenShell key="streak" stepLabel="Step 4 of 4">
            <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center text-center">
              <div className="relative">
                <Bity pose="sleeping" />
                <motion.div
                  animate={{ scale: [1, 1.08] }}
                  className="absolute -right-2 top-4 flex h-14 w-14 items-center justify-center rounded-full bg-duo-yellow"
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                >
                  <Flame className="h-8 w-8 fill-white text-white" />
                </motion.div>
              </div>
              <h1 className="mt-5 text-[clamp(1.875rem,8vw,3rem)] font-black tracking-normal">
                Come back every day to keep your streak alive!
              </h1>
              <p className="mt-3 text-lg font-bold text-duo-grey-text">
                We&apos;ll land you on {primaryTrack.title}, Section {placementSection}.
              </p>
              <div className="mt-7 grid w-full gap-3 sm:grid-cols-2">
                <DuoButton
                  icon={<Bell className="h-5 w-5" />}
                  onClick={() => void finishOnboarding(true)}
                >
                  Allow reminders
                </DuoButton>
                <DuoButton onClick={() => void finishOnboarding(false)} variant="grey">
                  Not now
                </DuoButton>
              </div>
            </div>
          </ScreenShell>
        )}
      </AnimatePresence>
    </main>
  );
}
