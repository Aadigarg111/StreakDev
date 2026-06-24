"use client";

import { LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { LandingPage } from "@/components/marketing/landing-page";
import { StreakDevApp } from "@/components/app/streakdev-app";

type AuthState = { authenticated: boolean; user: unknown | null };

export function HomeAuthGate() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((response) => response.json() as Promise<AuthState>)
      .then((next) => {
        if (!cancelled) setAuth(next);
      })
      .catch(() => {
        if (!cancelled) setAuth({ authenticated: false, user: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (auth?.authenticated) {
      window.location.replace("/learn");
    }
  }, [auth]);

  if (!auth || auth.authenticated) {
    return <div className="grid min-h-dvh place-items-center bg-duo-grey-bg text-duo-grey-text"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return <LandingPage />;
}

export function ProtectedAppGate() {
  const [auth, setAuth] = useState<AuthState | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then((response) => response.json() as Promise<AuthState>)
      .then((next) => {
        if (!cancelled) setAuth(next);
      })
      .catch(() => {
        if (!cancelled) setAuth({ authenticated: false, user: null });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (auth && !auth.authenticated) {
      window.location.replace("/");
    }
  }, [auth]);

  if (!auth || !auth.authenticated) {
    return <div className="grid min-h-dvh place-items-center bg-duo-grey-bg text-duo-grey-text"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return <StreakDevApp />;
}
