"use client";

import { Code2, Flame, Home, Keyboard, Lock, Sparkles, Trophy, Users, Zap } from "lucide-react";
import { useState } from "react";
import { AuthDialog } from "@/components/auth/auth-status";
import { ThemeToggle } from "@/components/app/theme-toggle";
import { DuoButton } from "@/components/ui/duo-button";
import { tracks } from "@/lib/curriculum";

type AuthMode = "login" | "signup";

const liveTrackId = "html-css";

export function LandingPage() {
  const [dialogMode, setDialogMode] = useState<AuthMode | null>(null);
  const showcaseTracks = tracks.slice(0, 18);

  function handleAuthSuccess() {
    window.location.href = "/learn";
  }

  return (
    <main className="min-h-dvh bg-duo-grey-bg text-duo-eel">
      <header className="sticky top-0 z-30 border-b-2 border-duo-swan bg-duo-grey-bg/90 backdrop-blur">
        <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2 text-2xl font-black text-duo-eel">
            <Home className="h-8 w-8 text-duo-green" />
            <span>streakdev</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              className="hidden px-3 py-2 text-sm font-black text-duo-grey-text sm:inline-flex"
              onClick={() => setDialogMode("login")}
              type="button"
            >
              Log in
            </button>
            <DuoButton onClick={() => setDialogMode("signup")} size="sm">
              Get Started
            </DuoButton>
          </div>
        </nav>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-14 md:grid-cols-[1fr_0.92fr] md:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border-2 border-duo-swan bg-duo-snow px-4 py-2 text-sm font-black text-duo-green-dark">
            <Sparkles className="h-4 w-4" />
            Duolingo-style coding practice
          </div>
          <h1 className="mt-6 max-w-3xl text-[clamp(2.6rem,8vw,5rem)] font-black leading-[0.95] tracking-normal text-duo-eel">
            Learn to code, one streak at a time
          </h1>
          <p className="mt-5 max-w-2xl text-xl font-bold leading-8 text-duo-grey-text">
            Bite-sized lessons, real coding practice, and a streak that keeps you coming back - free forever.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <DuoButton onClick={() => setDialogMode("signup")} size="lg">
              Get Started - It&apos;s Free
            </DuoButton>
            <button
              className="font-black text-duo-blue-dark"
              onClick={() => setDialogMode("login")}
              type="button"
            >
              I already have an account
            </button>
          </div>
        </div>

        <div className="rounded-[2rem] border-2 border-duo-swan bg-duo-snow p-4 shadow-2xl shadow-duo-blue/10">
          <div className="rounded-[1.5rem] bg-duo-grey-panel p-4">
            <div className="mb-4 flex items-center justify-between gap-2">
              <span className="rounded-full bg-duo-green px-3 py-1 text-xs font-black text-white">
                LIVE NOW
              </span>
              <div className="flex gap-2 text-sm font-black">
                <span className="rounded-full bg-duo-snow px-3 py-2 text-duo-yellow-dark">
                  7 day streak
                </span>
                <span className="rounded-full bg-duo-snow px-3 py-2 text-duo-blue-dark">
                  120 XP
                </span>
              </div>
            </div>
            <div className="rounded-duo-lg bg-duo-yellow p-4 text-white shadow-[inset_0_-5px_0_rgb(0_0_0_/_0.16)]">
              <p className="text-sm font-black opacity-90">Current section</p>
              <h2 className="text-2xl font-black">HTML & CSS Foundations</h2>
            </div>
            <div className="relative mx-auto mt-6 min-h-[300px] max-w-sm">
              <div className="absolute left-1/2 top-2 h-64 -translate-x-1/2 border-l-4 border-dotted border-duo-swan" />
              {[
                { icon: Zap, active: true, title: "What is HTML?" },
                { icon: Lock, title: "Document structure" },
                { icon: Lock, title: "CSS basics" },
              ].map((unit, index) => {
                const Icon = unit.icon;

                return (
                  <div
                    className={`relative mb-6 flex w-36 flex-col items-center ${index % 2 ? "ml-auto" : "ml-4"}`}
                    key={unit.title}
                  >
                    <div
                      className={`grid h-20 w-20 place-items-center rounded-full border-b-4 ${
                        unit.active
                          ? "border-duo-green-dark bg-duo-green text-white shadow-[0_0_0_10px_rgb(88_204_2_/_0.14)]"
                          : "border-duo-grey-disabled bg-duo-swan text-white"
                      }`}
                    >
                      <Icon className="h-9 w-9" />
                    </div>
                    <p className="mt-2 text-center text-sm font-black">{unit.title}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-12 text-center" id="what-is-streakdev">
        <h2 className="text-4xl font-black">What is streakdev?</h2>
        <p className="mt-4 text-lg font-bold leading-8 text-duo-grey-text">
          Streakdev is a Duolingo-style app for learning to code. You move through bite-sized lessons,
          earn XP and streaks, and practice with real coding exercises. HTML & CSS is live now, with
          more tracks coming soon.
        </p>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-4">
        {[
          [Flame, "Bite-sized lessons", "Build momentum in five focused minutes a day."],
          [Keyboard, "Real coding practice", "Write, debug, and reason through actual code."],
          [Trophy, "Track your streak", "Turn daily practice into a habit you can see."],
          [Users, "Compete with friends", "Leaderboards and live battles keep learning social."],
        ].map(([Icon, title, body]) => (
          <article className="rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5" key={title as string}>
            <Icon className="h-9 w-9 text-duo-green" />
            <h3 className="mt-4 text-xl font-black">{title as string}</h3>
            <p className="mt-2 font-bold leading-6 text-duo-grey-text">{body as string}</p>
          </article>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="mb-6 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase text-duo-green">Tracks</p>
            <h2 className="text-4xl font-black">Pick your coding path</h2>
          </div>
          <p className="max-w-lg font-bold text-duo-grey-text">
            HTML & CSS is live now. More tracks are coming soon.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {showcaseTracks.map((track) => {
            const locked = track.id !== liveTrackId;

            return (
              <div
                className={`flex items-center gap-3 rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-4 ${
                  locked ? "opacity-65" : ""
                }`}
                key={track.id}
              >
                <span
                  className="grid h-12 w-12 shrink-0 place-items-center rounded-duo text-white"
                  style={{ backgroundColor: track.color }}
                >
                  <Code2 className="h-6 w-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate font-black">{track.title}</p>
                    {locked && (
                      <span className="shrink-0 rounded-full bg-duo-grey-panel px-2 py-0.5 text-[10px] font-black uppercase text-duo-grey-disabled">
                        Coming soon
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-bold text-duo-grey-text">{track.sections.length} sections</p>
                </div>
                {locked && <Lock className="h-5 w-5 shrink-0 text-duo-grey-disabled" />}
              </div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 text-center">
        <h2 className="text-4xl font-black">Ready to build your coding streak?</h2>
        <p className="mt-3 text-lg font-bold text-duo-grey-text">Join developers learning to code every day.</p>
        <DuoButton className="mt-7" onClick={() => setDialogMode("signup")} size="lg">
          Get Started - It&apos;s Free
        </DuoButton>
      </section>

      <footer className="border-t-2 border-duo-swan px-4 py-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm font-bold text-duo-grey-text sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright 2026 streakdev. Keep your streak alive.</p>
          <div className="flex gap-4">
            <a href="#what-is-streakdev">About</a>
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <a href="https://github.com" rel="noreferrer" target="_blank">
              GitHub
            </a>
          </div>
        </div>
      </footer>

      {dialogMode && (
        <AuthDialog mode={dialogMode} onClose={() => setDialogMode(null)} onSuccess={handleAuthSuccess} />
      )}
    </main>
  );
}
