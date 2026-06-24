"use client";

import { LoaderCircle, LogIn, LogOut, UserPlus, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { DuoButton } from "@/components/ui/duo-button";
import { cn } from "@/lib/cn";

type AuthState = {
  authenticated: boolean;
  user: {
    id: string;
    email: string;
    displayName: string;
    avatarSeed: string;
  } | null;
};

type AuthMode = "login" | "signup";

function avatarColor(seed: string) {
  const colors = ["#58CC02", "#1CB0F6", "#CE82FF", "#FFC800", "#FF4B4B"];
  const total = seed.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return colors[total % colors.length];
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function AuthAvatar({ name, seed }: { name: string; seed: string }) {
  return (
    <span
      aria-hidden
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black text-white"
      style={{ backgroundColor: avatarColor(seed) }}
    >
      {initials(name) || "SD"}
    </span>
  );
}

function AuthDialog({
  mode,
  onClose,
  onSuccess,
}: {
  mode: AuthMode;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [authMode, setAuthMode] = useState(mode);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetNoteVisible, setResetNoteVisible] = useState(false);
  const title = authMode === "login" ? "Log in" : "Sign up";
  const passwordValid = password.length >= 8;
  const passwordsMatch = authMode === "login" || password === confirmPassword;
  const canSubmit = email.trim().length > 0 && passwordValid && passwordsMatch && !submitting;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    const response = await fetch(`/api/auth/${authMode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, displayName }),
    });
    const body = await response.json().catch(() => ({}));

    setSubmitting(false);

    if (!response.ok) {
      setError(body.error ?? "Something went wrong.");
      return;
    }

    onSuccess();
    onClose();
  }

  async function requestReset() {
    setResetNoteVisible(true);
    await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }).catch(() => undefined);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-duo-lg border-2 border-duo-swan bg-duo-snow p-5 text-duo-eel shadow-2xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black">{title}</h2>
            <p className="mt-1 text-sm font-bold text-duo-grey-text">
              Save your streak, quests, and league progress.
            </p>
          </div>
          <button
            aria-label="Close"
            className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-duo-swan text-duo-grey-text"
            onClick={onClose}
            type="button"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="mt-5 grid gap-3" onSubmit={submit}>
          <label className="grid gap-1 text-sm font-black">
            Email
            <input
              autoComplete="email"
              className="h-12 rounded-duo border-2 border-duo-swan px-3 font-bold outline-none focus:border-duo-blue focus:ring-4 focus:ring-duo-blue/20"
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              value={email}
            />
          </label>

          {authMode === "signup" && (
            <label className="grid gap-1 text-sm font-black">
              Display name
              <input
                autoComplete="name"
                className="h-12 rounded-duo border-2 border-duo-swan px-3 font-bold outline-none focus:border-duo-blue focus:ring-4 focus:ring-duo-blue/20"
                onChange={(event) => setDisplayName(event.target.value)}
                value={displayName}
              />
            </label>
          )}

          <label className="grid gap-1 text-sm font-black">
            Password
            <input
              autoComplete={authMode === "login" ? "current-password" : "new-password"}
              className="h-12 rounded-duo border-2 border-duo-swan px-3 font-bold outline-none focus:border-duo-blue focus:ring-4 focus:ring-duo-blue/20"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>

          {authMode === "signup" && (
            <label className="grid gap-1 text-sm font-black">
              Confirm password
              <input
                autoComplete="new-password"
                className="h-12 rounded-duo border-2 border-duo-swan px-3 font-bold outline-none focus:border-duo-blue focus:ring-4 focus:ring-duo-blue/20"
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                value={confirmPassword}
              />
            </label>
          )}

          {!passwordValid && password.length > 0 && (
            <p className="text-sm font-bold text-duo-red-dark">
              Password must be at least 8 characters.
            </p>
          )}
          {!passwordsMatch && (
            <p className="text-sm font-bold text-duo-red-dark">Passwords do not match.</p>
          )}
          {error && <p className="text-sm font-bold text-duo-red-dark">{error}</p>}
          {resetNoteVisible && (
            <p className="rounded-duo bg-duo-grey-panel p-3 text-sm font-bold text-duo-grey-text">
              Password reset email delivery is coming soon. Contact support for now.
            </p>
          )}

          <DuoButton
            disabled={!canSubmit}
            icon={submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : undefined}
            type="submit"
          >
            {submitting ? "Working..." : title}
          </DuoButton>
        </form>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm font-black">
          <button
            className="text-duo-blue-dark"
            onClick={() => {
              setAuthMode(authMode === "login" ? "signup" : "login");
              setError(null);
            }}
            type="button"
          >
            {authMode === "login" ? "Create an account" : "I already have an account"}
          </button>
          {authMode === "login" && (
            <button className="text-duo-grey-text" onClick={requestReset} type="button">
              Forgot password?
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function AuthStatus() {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [dialogMode, setDialogMode] = useState<AuthMode | null>(null);
  const displayName = authState?.user?.displayName ?? "";
  const signedIn = Boolean(authState?.authenticated && authState.user);
  const buttonLabel = useMemo(() => (signedIn ? displayName : "Log in"), [displayName, signedIn]);

  async function refreshAuth() {
    const response = await fetch("/api/auth/me");
    const nextAuthState = (await response.json()) as AuthState;

    setAuthState(nextAuthState);

    if (nextAuthState.authenticated) {
      window.dispatchEvent(new CustomEvent("streakdev-auth-changed"));
    }
  }

  useEffect(() => {
    let cancelled = false;

    fetch("/api/auth/me")
      .then((response) => response.json() as Promise<AuthState>)
      .then((nextAuthState) => {
        if (!cancelled) {
          setAuthState(nextAuthState);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAuthState({ authenticated: false, user: null });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAuthState({ authenticated: false, user: null });
  }

  if (!authState) {
    return (
      <div className="flex min-h-11 items-center justify-center rounded-duo border-2 border-duo-swan bg-duo-snow px-3 text-duo-grey-disabled">
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div
        className={cn(
          "flex min-h-11 items-center gap-2 rounded-duo border-2 border-duo-swan bg-duo-snow px-2 text-sm font-black",
          !signedIn && "p-0",
        )}
      >
        {signedIn && authState.user ? (
          <>
            <AuthAvatar name={authState.user.displayName} seed={authState.user.avatarSeed} />
            <span className="max-w-24 truncate">{buttonLabel}</span>
            <button
              aria-label="Log out"
              className="flex h-8 w-8 items-center justify-center rounded-full text-duo-grey-text"
              onClick={logout}
              title="Log out"
              type="button"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="flex gap-2">
            <DuoButton
              icon={<LogIn className="h-5 w-5" />}
              onClick={() => setDialogMode("login")}
              size="sm"
              variant="grey"
            >
              Log in
            </DuoButton>
            <DuoButton
              icon={<UserPlus className="h-5 w-5" />}
              onClick={() => setDialogMode("signup")}
              size="sm"
            >
              Sign up
            </DuoButton>
          </div>
        )}
      </div>
      {dialogMode && (
        <AuthDialog
          mode={dialogMode}
          onClose={() => setDialogMode(null)}
          onSuccess={() => void refreshAuth()}
        />
      )}
    </>
  );
}
