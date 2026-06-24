"use client";

import {
  Check,
  Flame,
  Gem,
  Heart,
  Home,
  LoaderCircle,
  Lock,
  RotateCcw,
  Star,
  Target,
  Trophy,
  UserCircle,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Track } from "../../../types/content";
import { getVisibleSections, tracks } from "@/lib/curriculum";
import { cn } from "@/lib/cn";
import { DuoButton } from "@/components/ui/duo-button";
import { AuthStatus } from "@/components/auth/auth-status";
import type { TrackProgress } from "@/store/user-progress";

type PathViewProps = {
  track: Track;
  enrolledTrackIds: string[];
  progress: TrackProgress;
  dailyGoalXp: number;
  stats: {
    hearts: number;
    maxHearts: number;
    xp: number;
    streakDays: number;
    gems: number;
  };
  completedUnitIds: string[];
  onSwitchTrack: (trackId: string) => void;
  onReset: () => void;
  onStartLesson: () => void;
};

type ActiveView = "learn" | "league" | "quests" | "profile";

type MobileNavItem = {
  label: string;
  icon: typeof Home;
  view?: ActiveView;
};

type LeaderboardResponse = {
  league: { tier: string; weekEndDate: string } | null;
  leaderboard: Array<{
    rank: number;
    displayName: string;
    avatarSeed: string;
    weeklyXp: number;
    isCurrentUser: boolean;
  }>;
  rank: number | null;
  zone: "promotion" | "safe" | "demotion";
  timeRemainingMs: number;
};

type QuestResponse = {
  dailyQuests?: {
    date: string;
    quests: Array<{
      id: string;
      description: string;
      target: number;
      currentProgress: number;
      completed: boolean;
      gemsReward: number;
    }>;
  };
};

type AchievementResponse = {
  achievements: Array<{
    id: string;
    label: string;
    description: string;
    unlocked: boolean;
    unlockedAt: string | null;
  }>;
};

function avatarColor(seed: string) {
  const colors = ["#58CC02", "#1CB0F6", "#CE82FF", "#FFC800", "#FF4B4B"];
  const total = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return colors[total % colors.length];
}

function MiniAvatar({ name, seed }: { name: string; seed: string }) {
  return (
    <span
      aria-hidden
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
      style={{ backgroundColor: avatarColor(seed) }}
    >
      {name.slice(0, 2).toUpperCase()}
    </span>
  );
}

function LeagueView() {
  const [data, setData] = useState<LeaderboardResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const response = await fetch("/api/leaderboard");

      if (!response.ok) {
        setError(true);
        return;
      }

      const body = (await response.json()) as LeaderboardResponse;

      if (!cancelled) {
        setData(body);
        setError(false);
      }
    }

    void load();
    const interval = window.setInterval(() => void load(), 45000);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  if (error) {
    return <EmptyState icon={Trophy} title="Sign in to join a league" />;
  }

  if (!data) {
    return <LoadingState title="Loading league" />;
  }

  const hoursRemaining = Math.max(0, Math.ceil(data.timeRemainingMs / (1000 * 60 * 60)));

  return (
    <section className="space-y-4 pt-5">
      <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5">
        <p className="text-sm font-black uppercase text-duo-grey-disabled">{data.league?.tier ?? "Bronze"} league</p>
        <h2 className="mt-1 text-3xl font-black">Rank #{data.rank ?? "-"}</h2>
        <p className="mt-1 text-sm font-bold text-duo-grey-text">
          {data.zone === "promotion" ? "Promotion zone" : data.zone === "demotion" ? "Demotion zone" : "Safe zone"} -
          {" "}
          {hoursRemaining}h left
        </p>
      </div>
      <div className="overflow-hidden rounded-duo-lg border-2 border-duo-swan bg-duo-snow">
        {data.leaderboard.map((member) => (
          <div
            className={cn(
              "grid grid-cols-[36px_1fr_auto] items-center gap-3 border-b-2 border-duo-swan p-3 last:border-b-0",
              member.isCurrentUser && "bg-[#F1FFE8]",
            )}
            key={`${member.rank}-${member.displayName}`}
          >
            <span className="text-center text-sm font-black text-duo-grey-disabled">{member.rank}</span>
            <div className="flex min-w-0 items-center gap-2">
              <MiniAvatar name={member.displayName} seed={member.avatarSeed} />
              <span className="truncate font-black">{member.displayName}</span>
            </div>
            <span className="font-black text-duo-yellow-dark">{member.weeklyXp} XP</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuestsView() {
  const [data, setData] = useState<QuestResponse | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/quests")
      .then((response) => {
        if (!response.ok) {
          throw new Error("unauthenticated");
        }

        return response.json() as Promise<QuestResponse>;
      })
      .then((body) => {
        setData(body);
        setError(false);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return <EmptyState icon={Target} title="Sign in to track quests" />;
  }

  if (!data?.dailyQuests) {
    return <LoadingState title="Loading quests" />;
  }

  return (
    <section className="space-y-4 pt-5">
      <h2 className="text-3xl font-black">Daily quests</h2>
      {data.dailyQuests.quests.map((quest) => {
        const percent = Math.min(100, (quest.currentProgress / quest.target) * 100);

        return (
          <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5" key={quest.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-black">{quest.description}</p>
                <p className="mt-1 text-sm font-bold text-duo-grey-text">
                  {quest.currentProgress}/{quest.target} - {quest.gemsReward} gems
                </p>
              </div>
              {quest.completed && <Check className="h-6 w-6 text-duo-green" />}
            </div>
            <div className="mt-4 h-4 overflow-hidden rounded-full bg-duo-swan">
              <div className="h-full rounded-full bg-duo-green" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ProfileView({
  stats,
  completedUnitIds,
}: {
  stats: PathViewProps["stats"];
  completedUnitIds: string[];
}) {
  const [achievements, setAchievements] = useState<AchievementResponse["achievements"]>([]);

  useEffect(() => {
    fetch("/api/achievements")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((body: AchievementResponse) => setAchievements(body.achievements))
      .catch(() => setAchievements([]));
  }, []);

  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <section className="space-y-4 pt-5">
      <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5">
        <p className="text-sm font-black uppercase text-duo-grey-disabled">Profile</p>
        <h2 className="mt-1 text-3xl font-black">{stats.xp} XP</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm font-black">
          <span className="rounded-duo bg-duo-grey-panel px-3 py-2">{stats.streakDays} day streak</span>
          <span className="rounded-duo bg-duo-grey-panel px-3 py-2">{stats.gems} gems</span>
          <span className="rounded-duo bg-duo-grey-panel px-3 py-2">{completedUnitIds.length} units</span>
          <span className="rounded-duo bg-duo-grey-panel px-3 py-2">{unlockedCount} badges</span>
        </div>
      </div>
      <AchievementsGrid achievements={achievements} />
    </section>
  );
}

function AchievementsGrid({ achievements }: { achievements: AchievementResponse["achievements"] }) {
  if (achievements.length === 0) {
    return <EmptyState icon={UserCircle} title="Sign in to unlock badges" />;
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {achievements.map((achievement) => (
        <div
          className={cn(
            "rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-4",
            !achievement.unlocked && "grayscale",
          )}
          key={achievement.id}
        >
          <Trophy className={cn("h-8 w-8", achievement.unlocked ? "fill-duo-yellow text-duo-yellow" : "text-duo-grey-disabled")} />
          <p className="mt-3 font-black">{achievement.label}</p>
          <p className="mt-1 text-sm font-bold text-duo-grey-text">{achievement.description}</p>
        </div>
      ))}
    </div>
  );
}

function LoadingState({ title }: { title: string }) {
  return (
    <div className="grid min-h-[360px] place-items-center pt-5">
      <div className="flex items-center gap-2 font-black text-duo-grey-text">
        <LoaderCircle className="h-5 w-5 animate-spin" />
        {title}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title }: { icon: typeof Trophy; title: string }) {
  return (
    <div className="grid min-h-[360px] place-items-center pt-5">
      <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-6 text-center">
        <Icon className="mx-auto h-10 w-10 text-duo-grey-disabled" />
        <p className="mt-3 font-black">{title}</p>
      </div>
    </div>
  );
}

export function PathView({
  track,
  enrolledTrackIds,
  progress,
  dailyGoalXp,
  stats,
  completedUnitIds,
  onSwitchTrack,
  onReset,
  onStartLesson,
}: PathViewProps) {
  const reducedMotion = useReducedMotion();
  const [activeView, setActiveView] = useState<ActiveView>("learn");
  const visibleSections = getVisibleSections(track, progress.currentSection);
  const enrolledTracks = tracks.filter((item) => enrolledTrackIds.includes(item.id));
  const mobileNavItems: MobileNavItem[] = [
    { label: "Learn", icon: Home, view: "learn" as const },
    { label: "Battle", icon: Zap },
    { label: "League", icon: Trophy, view: "league" as const },
    { label: "Quests", icon: Target, view: "quests" as const },
    { label: "Profile", icon: UserCircle, view: "profile" as const },
  ];

  return (
    <main className="min-h-dvh bg-duo-grey-bg pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-duo-eel lg:pb-0">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-3 py-4 xs:px-4 md:px-6 lg:grid-cols-[220px_minmax(0,1fr)_260px] lg:py-5">
        <aside className="hidden border-r-2 border-duo-swan pr-4 lg:block">
          <div className="mb-7 flex items-center gap-2 text-2xl font-black">
            <Home className="h-7 w-7 text-duo-green" />
            StreakDev
          </div>
          <nav className="grid gap-2">
            {[
              { label: "Learn", view: "learn" as const, icon: Home },
              { label: "League", view: "league" as const, icon: Trophy },
              { label: "Quests", view: "quests" as const, icon: Target },
              { label: "Profile", view: "profile" as const, icon: UserCircle },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <button
                  className={cn(
                    "flex items-center gap-2 rounded-duo border-2 px-3 py-3 text-left text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
                    item.view === activeView
                      ? "border-duo-green bg-[#F1FFE8] text-duo-green-dark"
                      : "border-duo-swan bg-duo-snow text-duo-grey-text",
                  )}
                  key={item.view}
                  onClick={() => setActiveView(item.view)}
                  type="button"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
            {enrolledTracks.map((item) => (
              <button
                className={cn(
                  "rounded-duo border-2 px-3 py-3 text-left text-sm font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
                  item.id === track.id
                    ? "border-duo-green bg-[#F1FFE8] text-duo-green-dark"
                    : "border-duo-swan bg-duo-snow text-duo-grey-text",
                )}
                key={item.id}
                onClick={() => onSwitchTrack(item.id)}
                type="button"
              >
                {item.title}
              </button>
            ))}
          </nav>
        </aside>

        <section className="mx-auto w-full max-w-[600px]">
          <header className="sticky top-0 z-20 -mx-3 border-b-2 border-duo-swan bg-duo-grey-bg/95 px-3 pb-4 pt-safe backdrop-blur xs:-mx-4 xs:px-4 lg:top-0">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-black text-duo-green">Learn</p>
                <h1 className="text-[clamp(1.45rem,6vw,2rem)] font-black tracking-normal">
                  {track.title}
                </h1>
              </div>
              <div className="flex w-full flex-wrap items-center gap-1.5 sm:w-auto sm:gap-2">
                <button
                  aria-label="Start over"
                  className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-duo-swan bg-duo-snow text-duo-grey-text transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25 active:translate-y-1"
                  onClick={onReset}
                  title="Start over"
                  type="button"
                >
                  <RotateCcw className="h-5 w-5" />
                </button>
                <span className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border-2 border-duo-swan px-2 text-[13px] font-black sm:px-3 sm:text-sm">
                  <Flame className="h-5 w-5 fill-duo-yellow text-duo-yellow" />
                  {stats.streakDays}
                </span>
                <span className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border-2 border-duo-swan px-2 text-[13px] font-black sm:px-3 sm:text-sm">
                  <Trophy className="h-5 w-5 fill-duo-yellow text-duo-yellow" />
                  <span>{stats.xp} XP</span>
                </span>
                <span className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border-2 border-duo-swan px-2 text-[13px] font-black sm:px-3 sm:text-sm">
                  <Heart className="h-5 w-5 fill-duo-red text-duo-red" />
                  {stats.hearts}
                </span>
                <span className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full border-2 border-duo-swan px-2 text-[13px] font-black sm:px-3 sm:text-sm">
                  <Gem className="h-5 w-5 fill-duo-purple text-duo-purple" />
                  {stats.gems}
                </span>
                <AuthStatus />
              </div>
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 lg:hidden">
              {enrolledTracks.map((item) => (
                <button
                  className={cn(
                    "touch-target shrink-0 rounded-full border-2 px-3 py-2 text-xs font-black",
                    item.id === track.id
                      ? "border-duo-green bg-[#F1FFE8] text-duo-green-dark"
                      : "border-duo-swan bg-duo-snow text-duo-grey-text",
                  )}
                  key={item.id}
                  onClick={() => onSwitchTrack(item.id)}
                  type="button"
                >
                  {item.title}
                </button>
              ))}
            </div>
          </header>

          {activeView === "learn" && (
          <div className="space-y-8 pt-5">
            {visibleSections.map((section) => {
              const isCurrent = section.order === progress.currentSection;
              const isCompleted = section.order <= progress.completedThroughSection;
              const isLockedPreview = section.order > progress.currentSection;

              return (
                <section key={section.id} className="space-y-5">
                  <div
                    className={cn(
                      "rounded-duo-lg border-b-4 p-5 text-white",
                      isLockedPreview && "grayscale",
                    )}
                    style={{
                      backgroundColor: isLockedPreview ? "#AFAFAF" : section.bannerColor,
                      borderColor: "rgb(75 75 75 / 0.2)",
                    }}
                  >
                    <p className="text-sm font-black opacity-90">
                      {isLockedPreview ? "Locked preview" : isCompleted ? "Placed by level check" : "Current section"}
                    </p>
                    <h2 className="mt-1 text-[clamp(1.35rem,5vw,1.75rem)] font-black tracking-normal">
                      {section.title}
                    </h2>
                  </div>

                  <div className="relative mx-auto min-h-[760px] w-full max-w-[28rem]">
                    <div className="absolute left-1/2 top-8 h-[700px] -translate-x-1/2 border-l-4 border-dotted border-duo-swan" />
                    {section.units.map((unit, index) => {
                      const isActive = isCurrent && unit.order === progress.currentUnit;
                      const isDone = isCompleted || completedUnitIds.includes(unit.id);
                      const isSkippedByPlacement =
                        isDone && progress.placementSource === "placement";
                      const isLocked = isLockedPreview || (!isDone && !isActive);
                      const offset = index % 2 === 0 ? "ml-4 xs:ml-6" : "ml-auto mr-4 xs:mr-6";

                      return (
                        <motion.div
                          animate={
                            reducedMotion || !isActive
                              ? undefined
                              : { scale: [1, 1.05] }
                          }
                          className={cn("relative mb-7 flex w-40 flex-col items-center xs:w-44", offset)}
                          key={unit.id}
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                            repeat: Infinity,
                            repeatDelay: 1.1,
                            repeatType: "mirror",
                          }}
                        >
                          <button
                            aria-label={`${isDone ? "Completed" : isActive ? "Start" : "Locked"} Unit ${unit.order}: ${unit.title}`}
                            className={cn(
                              "flex h-[72px] w-[72px] items-center justify-center rounded-full border-b-4 text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25 xs:h-20 xs:w-20",
                              isDone && !isSkippedByPlacement && "border-duo-green-dark bg-duo-green",
                              isSkippedByPlacement &&
                                "border-duo-grey-disabled bg-duo-grey-border text-white",
                              isActive && "border-duo-green-dark bg-duo-green shadow-[0_0_0_8px_rgb(88_204_2_/_0.16)]",
                              isLocked && "border-duo-grey-disabled bg-duo-grey-border text-duo-grey-disabled",
                            )}
                            disabled={!isActive}
                            onClick={isActive ? onStartLesson : undefined}
                            type="button"
                          >
                            {isDone ? (
                              <Check className="h-9 w-9 stroke-[4]" />
                            ) : isActive ? (
                              <Star className="h-9 w-9 fill-current" />
                            ) : (
                              <Lock className="h-8 w-8" />
                            )}
                          </button>
                          {isActive && (
                            <span className="mt-2 rounded-full bg-duo-green px-3 py-1 text-xs font-black text-white">
                              START
                            </span>
                          )}
                          <p className="mt-2 text-center text-sm font-black leading-5">
                            Unit {unit.order}: {unit.title}
                          </p>
                        </motion.div>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
          )}
          {activeView === "league" && <LeagueView />}
          {activeView === "quests" && <QuestsView />}
          {activeView === "profile" && (
            <ProfileView completedUnitIds={completedUnitIds} stats={stats} />
          )}
        </section>

        <aside className="hidden space-y-4 lg:block">
          <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
            <p className="text-sm font-black text-duo-grey-disabled">Daily Goal</p>
            <p className="text-2xl font-black">{dailyGoalXp} XP</p>
              </div>
              <Trophy className="h-10 w-10 fill-duo-yellow text-duo-yellow" />
            </div>
            <div className="mt-4 h-4 overflow-hidden rounded-full bg-duo-swan">
              <div className="h-full w-2/5 rounded-full bg-gradient-to-r from-duo-green to-duo-blue" />
            </div>
          </div>
          <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5">
            <p className="text-sm font-black text-duo-grey-disabled">Stats</p>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-black">
              <span className="rounded-duo bg-duo-grey-panel px-3 py-2">
                {stats.hearts}/{stats.maxHearts} hearts
              </span>
              <span className="rounded-duo bg-duo-grey-panel px-3 py-2">
                {stats.xp} XP
              </span>
              <span className="rounded-duo bg-duo-grey-panel px-3 py-2">
                {stats.streakDays} day streak
              </span>
              <span className="rounded-duo bg-duo-grey-panel px-3 py-2">
                {stats.gems} gems
              </span>
            </div>
          </div>
          <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5">
            <p className="text-sm font-black text-duo-grey-disabled">Path depth</p>
            <p className="mt-1 text-lg font-black">10 sections - 100 units</p>
            <p className="mt-2 text-sm font-bold leading-5 text-duo-grey-text">
              Next section unlocks after this chunk.
            </p>
          </div>
          <DuoButton
            className="w-full"
            icon={<RotateCcw className="h-5 w-5" />}
            onClick={onReset}
            variant="grey"
          >
            Start over
          </DuoButton>
        </aside>
      </div>
      <nav
        aria-label="Primary"
        className="fixed inset-x-0 bottom-0 z-30 border-t-2 border-duo-swan bg-duo-snow/95 px-2 pb-safe pt-2 backdrop-blur lg:hidden"
      >
        <div className="mx-auto grid max-w-xl grid-cols-5 gap-1">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = item.view === activeView;
            const disabled = !item.view;

            return (
              <button
                aria-current={active ? "page" : undefined}
                aria-disabled={disabled}
                className={cn(
                  "touch-target flex flex-col items-center justify-center rounded-duo px-1 py-1 text-[11px] font-black transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
                  active
                    ? "bg-[#F1FFE8] text-duo-green-dark"
                    : "text-duo-grey-disabled",
                )}
                key={item.label}
                onClick={item.view ? () => setActiveView(item.view as ActiveView) : undefined}
                type="button"
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    active && "fill-duo-green text-duo-green",
                  )}
                />
                <span className="mt-0.5 truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
