"use client";

import {
  ArrowLeft,
  Check,
  ChevronDown,
  Crown,
  Dumbbell,
  Flame,
  Gem,
  Home,
  ListChecks,
  LoaderCircle,
  Lock,
  MoreHorizontal,
  NotebookTabs,
  Plus,
  Shield,
  Star,
  Store,
  Trophy,
  UserCircle,
  Zap,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import type { Track } from "../../../types/content";
import { getVisibleSections, tracks } from "@/lib/curriculum";
import { cn } from "@/lib/cn";
import { AuthStatus } from "@/components/auth/auth-status";
import { ThemeToggle } from "@/components/app/theme-toggle";
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

type RailItem = {
  label: string;
  icon: typeof Home;
  view?: ActiveView;
  tone: "yellow" | "blue" | "gold" | "red" | "peach" | "purple";
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

function CourseMark({ track, selected = false }: { track: Track; selected?: boolean }) {
  if (track.id === "javascript") {
    return (
      <span
        aria-hidden
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-duo-swan bg-[#f7df1e] text-sm font-black text-[#20232a]",
          selected && "border-duo-green",
        )}
      >
        JS
      </span>
    );
  }

  if (track.id === "html-css") {
    return (
      <span
        aria-hidden
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-lg border-2 border-duo-swan bg-white text-[10px] font-black text-white",
          selected && "border-duo-green",
        )}
      >
        <span className="grid h-full w-full grid-cols-2">
          <span className="grid place-items-center bg-[#e44d26]">H</span>
          <span className="grid place-items-center bg-[#264de4]">C</span>
        </span>
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "grid h-10 w-10 shrink-0 place-items-center rounded-lg border-2 border-duo-swan text-sm font-black text-white",
        selected && "border-duo-green",
      )}
      style={{ backgroundColor: track.color }}
    >
      {track.title
        .split(/\s+/)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase()}
    </span>
  );
}

function RailIcon({
  icon: Icon,
  tone,
}: {
  icon: typeof Home;
  tone: RailItem["tone"];
}) {
  const styles: Record<RailItem["tone"], string> = {
    blue: "bg-[#1cb0f6] text-white shadow-[inset_0_-4px_0_rgb(24_153_214)]",
    gold: "bg-[#ffc800] text-[#8a5c00] shadow-[inset_0_-4px_0_rgb(230_180_0)]",
    peach: "bg-[#ffd6bf] text-[#c86b27] shadow-[inset_0_-4px_0_rgb(224_155_99)]",
    purple: "bg-[#ce82ff] text-white shadow-[inset_0_-4px_0_rgb(160_92_219)]",
    red: "bg-[#ff4b4b] text-white shadow-[inset_0_-4px_0_rgb(210_43_43)]",
    yellow: "bg-[#ffc800] text-[#7d5b00] shadow-[inset_0_-4px_0_rgb(230_180_0)]",
  };

  return (
    <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", styles[tone])}>
      <Icon className="h-5 w-5 stroke-[3]" />
    </span>
  );
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
              member.isCurrentUser && "bg-[#F1FFE8] dark:bg-duo-green/15",
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
    return <EmptyState icon={ListChecks} title="Sign in to track quests" />;
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
  const activeSection = visibleSections[0];
  const activeUnit = activeSection?.units.find((unit) => unit.order === progress.currentUnit) ?? activeSection?.units[0];
  const railItems: RailItem[] = [
    { label: "Learn", icon: Home, view: "learn" as const, tone: "yellow" },
    { label: "Practice", icon: Dumbbell, tone: "blue" },
    { label: "Leaderboards", icon: Shield, view: "league" as const, tone: "gold" },
    { label: "Quests", icon: ListChecks, view: "quests" as const, tone: "gold" },
    { label: "Shop", icon: Store, tone: "red" },
    { label: "Profile", icon: UserCircle, view: "profile" as const, tone: "peach" },
    { label: "More", icon: MoreHorizontal, tone: "purple" },
  ];
  const mobileNavItems: MobileNavItem[] = [
    { label: "Learn", icon: Home, view: "learn" as const },
    { label: "Practice", icon: Dumbbell },
    { label: "Leagues", icon: Shield, view: "league" as const },
    { label: "Quests", icon: ListChecks, view: "quests" as const },
    { label: "Profile", icon: UserCircle, view: "profile" as const },
  ];

  return (
    <main className="min-h-dvh bg-duo-grey-bg pb-[calc(5.5rem+env(safe-area-inset-bottom))] text-duo-eel lg:pb-0">
      <div className="grid w-full lg:grid-cols-[320px_minmax(0,1fr)_420px]">
        <aside className="hidden min-h-dvh border-r-2 border-duo-swan px-5 py-8 lg:block">
          <div className="mb-8 text-4xl font-black leading-none text-duo-green">
            StreakDev
          </div>
          <nav className="grid gap-3">
            {railItems.map((item) => {
              const active = item.view === activeView;
              const disabled = !item.view;

              return (
                <button
                  aria-current={active ? "page" : undefined}
                  aria-disabled={disabled}
                  className={cn(
                    "flex h-16 items-center gap-4 rounded-duo border-2 px-5 text-left text-[17px] font-black uppercase tracking-normal transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
                    active
                      ? "border-duo-blue bg-duo-snow text-duo-blue"
                      : "border-transparent text-duo-grey-text hover:bg-duo-snow/70",
                    disabled && "cursor-default opacity-80",
                  )}
                  key={item.label}
                  onClick={item.view ? () => setActiveView(item.view as ActiveView) : undefined}
                  type="button"
                >
                  <RailIcon icon={item.icon} tone={item.tone} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="mx-auto min-h-dvh w-full max-w-[740px] px-4 py-4 sm:px-6 lg:px-8 lg:py-7">
          <header className="sticky top-0 z-20 -mx-4 border-b-2 border-duo-swan bg-duo-grey-bg/95 px-4 pb-4 pt-safe backdrop-blur sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:border-b-0 lg:bg-transparent lg:p-0 lg:pb-8">
            <div className="flex items-center justify-between gap-3 lg:hidden">
              <details className="group relative">
                <summary className="flex h-12 cursor-pointer list-none items-center gap-2 rounded-duo border-2 border-duo-swan bg-duo-snow px-3 font-black text-duo-eel [&::-webkit-details-marker]:hidden">
                  <CourseMark track={track} selected />
                  <span className="max-w-[8.5rem] truncate">{track.title}</span>
                  <ChevronDown className="h-4 w-4 text-duo-grey-disabled transition group-open:rotate-180" />
                </summary>
                <div className="absolute left-0 top-14 z-30 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-duo-lg border-2 border-duo-swan bg-duo-snow shadow-xl">
                  <p className="border-b-2 border-duo-swan px-5 py-3 text-sm font-black uppercase text-duo-grey-disabled">
                    My courses
                  </p>
                  {enrolledTracks.map((item) => (
                    <button
                      className={cn(
                        "flex w-full items-center gap-4 border-b-2 border-duo-swan px-5 py-4 text-left font-black",
                        item.id === track.id ? "bg-duo-grey-panel text-duo-blue" : "text-duo-eel",
                      )}
                      key={item.id}
                      onClick={() => onSwitchTrack(item.id)}
                      type="button"
                    >
                      <CourseMark track={item} selected={item.id === track.id} />
                      {item.title}
                    </button>
                  ))}
                  <button
                    className="flex w-full items-center gap-4 px-5 py-4 text-left font-black text-duo-eel"
                    onClick={onReset}
                    type="button"
                  >
                    <span className="grid h-10 w-10 place-items-center rounded-lg border-2 border-duo-swan text-duo-grey-disabled">
                      <Plus className="h-5 w-5 stroke-[4]" />
                    </span>
                    Add a new course
                  </button>
                </div>
              </details>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-11 items-center gap-2 rounded-duo bg-duo-snow px-3 text-sm font-black">
                  <Flame className="h-5 w-5 fill-duo-grey-disabled text-duo-grey-disabled" />
                  {stats.streakDays}
                </span>
                <span className="inline-flex h-11 items-center gap-2 rounded-duo bg-duo-snow px-3 text-sm font-black text-duo-blue">
                  <Gem className="h-5 w-5 fill-duo-blue text-duo-blue" />
                  {stats.gems}
                </span>
              </div>
            </div>

            <div className="hidden rounded-duo-lg bg-[#06cfa3] p-5 text-white shadow-[inset_0_-4px_0_rgb(0_0_0_/_0.12)] lg:flex lg:items-center lg:justify-between">
              <div>
                <button className="mb-3 flex items-center gap-2 text-sm font-black uppercase text-white/80" type="button">
                  <ArrowLeft className="h-5 w-5 stroke-[4]" />
                  Section {activeSection?.order ?? progress.currentSection}, Unit {activeUnit?.order ?? progress.currentUnit}
                </button>
                <h1 className="text-2xl font-black tracking-normal">{activeUnit?.title ?? track.title}</h1>
              </div>
              <button
                className="flex h-16 items-center gap-3 rounded-duo border-2 border-black/10 bg-white/10 px-5 text-lg font-black uppercase shadow-[inset_0_-4px_0_rgb(0_0_0_/_0.12)]"
                type="button"
              >
                <NotebookTabs className="h-8 w-8 stroke-[3]" />
                Guidebook
              </button>
            </div>
          </header>

          {activeView === "learn" && (
          <div className="space-y-8 pt-5 lg:pt-8">
            {visibleSections.map((section) => {
              const isCurrent = section.order === progress.currentSection;
              const isCompleted = section.order <= progress.completedThroughSection;
              const isLockedPreview = section.order > progress.currentSection;

              return (
                <section key={section.id} className="space-y-5">
                  <div className="flex items-center gap-5 text-duo-grey-disabled">
                    <span className="h-0.5 flex-1 bg-duo-swan" />
                    <h2 className="text-center text-xl font-black tracking-normal">
                      {section.title}
                    </h2>
                    <span className="h-0.5 flex-1 bg-duo-swan" />
                  </div>

                  <div className="relative mx-auto min-h-[760px] w-full max-w-[30rem]">
                    <div className="absolute left-1/2 top-10 h-[690px] -translate-x-1/2 border-l-4 border-dotted border-duo-swan/80" />
                    {section.units.map((unit, index) => {
                      const isActive = isCurrent && unit.order === progress.currentUnit;
                      const isDone = isCompleted || completedUnitIds.includes(unit.id);
                      const isSkippedByPlacement =
                        isDone && progress.placementSource === "placement";
                      const isLocked = isLockedPreview || (!isDone && !isActive);
                      const offset = index % 3 === 0 ? "mx-auto" : index % 3 === 1 ? "ml-[12%]" : "ml-auto mr-[12%]";

                      return (
                        <motion.div
                          animate={
                            reducedMotion || !isActive
                              ? undefined
                              : { scale: [1, 1.05] }
                          }
                          className={cn("relative mb-8 flex w-36 flex-col items-center xs:w-44", offset)}
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
                              "relative flex h-[76px] w-[76px] items-center justify-center rounded-full border-b-[8px] text-white transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25 xs:h-24 xs:w-24",
                              isDone && !isSkippedByPlacement && "border-[#00a97f] bg-[#06cfa3]",
                              isSkippedByPlacement &&
                                "border-duo-grey-disabled bg-duo-grey-border text-white",
                              isActive && "border-[#009f78] bg-[#06cfa3] shadow-[0_0_0_10px_rgb(28_176_246_/_0.14)]",
                              isLocked && "border-duo-grey-disabled bg-duo-grey-border text-duo-grey-disabled",
                            )}
                            disabled={!isActive}
                            onClick={isActive ? onStartLesson : undefined}
                            type="button"
                          >
                            {isDone ? (
                              <Check className="h-11 w-11 stroke-[4]" />
                            ) : isActive ? (
                              <Star className="h-11 w-11 fill-current" />
                            ) : (
                              <Lock className="h-9 w-9" />
                            )}
                          </button>
                          {isActive && (
                            <span className="relative -mt-1 rounded-duo border-2 border-duo-swan bg-duo-grey-bg px-5 py-2 text-sm font-black text-[#06cfa3] shadow-sm">
                              START
                            </span>
                          )}
                          <p className="mt-2 text-center text-sm font-black leading-5 text-duo-grey-disabled">
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

        <aside className="hidden min-h-dvh space-y-5 border-l-2 border-duo-swan px-8 py-7 lg:block">
          <div className="flex items-center justify-between gap-4">
            <details className="group relative">
              <summary className="flex h-14 cursor-pointer list-none items-center gap-3 rounded-duo bg-duo-snow px-4 font-black text-duo-eel [&::-webkit-details-marker]:hidden">
                <CourseMark track={track} selected />
                <span>3</span>
                <ChevronDown className="h-4 w-4 text-duo-grey-disabled transition group-open:rotate-180" />
              </summary>
              <div className="absolute left-0 top-16 z-30 w-80 overflow-hidden rounded-duo-lg border-2 border-duo-swan bg-duo-snow shadow-xl">
                <p className="border-b-2 border-duo-swan px-6 py-4 text-sm font-black uppercase text-duo-grey-disabled">
                  My courses
                </p>
                {enrolledTracks.map((item) => (
                  <button
                    className={cn(
                      "flex w-full items-center gap-5 border-b-2 border-duo-swan px-6 py-4 text-left text-lg font-black",
                      item.id === track.id ? "bg-duo-grey-panel text-duo-blue" : "text-duo-eel",
                    )}
                    key={item.id}
                    onClick={() => onSwitchTrack(item.id)}
                    type="button"
                  >
                    <CourseMark track={item} selected={item.id === track.id} />
                    {item.title}
                  </button>
                ))}
                <button
                  className="flex w-full items-center gap-5 px-6 py-4 text-left text-lg font-black text-duo-eel"
                  onClick={onReset}
                  type="button"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-lg border-2 border-duo-swan text-duo-grey-disabled">
                    <Plus className="h-6 w-6 stroke-[4]" />
                  </span>
                  Add a new course
                </button>
              </div>
            </details>
            <span className="inline-flex h-14 items-center gap-2 rounded-duo px-3 text-lg font-black text-duo-grey-disabled">
              <Flame className="h-8 w-8 fill-duo-grey-border text-duo-grey-border" />
              {stats.streakDays}
            </span>
            <span className="inline-flex h-14 items-center gap-2 rounded-duo px-3 text-lg font-black text-duo-blue">
              <Gem className="h-8 w-8 fill-duo-blue text-duo-blue" />
              {stats.gems}
            </span>
            <ThemeToggle className="border-0 bg-transparent" />
          </div>

          <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-black">Bronze League</h2>
              <button className="text-sm font-black uppercase text-duo-blue" onClick={() => setActiveView("league")} type="button">
                View league
              </button>
            </div>
            <div className="mt-7 flex items-center gap-6">
              <span className="grid h-20 w-20 place-items-center rounded-2xl bg-[#f4c08b] text-[#a66327] shadow-[inset_0_-6px_0_rgb(166_99_39_/_0.25)]">
                <Crown className="h-11 w-11 fill-current" />
              </span>
              <div>
                <p className="text-lg font-black">You&apos;re ranked <span className="text-duo-green">#2</span></p>
                <p className="mt-2 text-base font-bold text-duo-grey-text">Keep it up to stay in the top 3!</p>
              </div>
            </div>
          </div>
          <div className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-2xl font-black">Daily Quests</h2>
              <button className="text-sm font-black uppercase text-duo-blue" onClick={() => setActiveView("quests")} type="button">
                View all
              </button>
            </div>
            <div className="mt-7 flex items-center gap-5">
              <Zap className="h-14 w-14 fill-duo-yellow text-duo-yellow" />
              <div className="min-w-0 flex-1">
                <p className="font-black">Earn {dailyGoalXp} XP</p>
                <div className="mt-3 h-4 overflow-hidden rounded-full bg-duo-swan">
                  <div className="h-full rounded-full bg-duo-yellow" style={{ width: `${Math.min(100, Math.round((stats.xp / Math.max(dailyGoalXp, 1)) * 100))}%` }} />
                </div>
              </div>
              <span className="text-sm font-black text-duo-grey-disabled">{Math.min(stats.xp, dailyGoalXp)} / {dailyGoalXp}</span>
            </div>
          </div>
          <AuthStatus />
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
                    ? "bg-[#F1FFE8] text-duo-green-dark dark:bg-duo-green/15"
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
