"use client";

import { GitBranch, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { DuoButton } from "@/components/ui/duo-button";

type AuthState = {
  authenticated: boolean;
  user: {
    avatarUrl: string | null;
    githubId: string;
    username: string;
  } | null;
};

export function GitHubAuthStatus() {
  const [authState, setAuthState] = useState<AuthState | null>(null);

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

  if (!authState) {
    return (
      <div className="flex min-h-11 items-center justify-center rounded-duo border-2 border-duo-swan bg-duo-snow px-3 text-duo-grey-disabled">
        <LoaderCircle className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (authState.authenticated && authState.user) {
    return (
      <div className="flex min-h-11 items-center gap-2 rounded-duo border-2 border-duo-swan bg-duo-snow px-3 text-sm font-black">
        {authState.user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            alt=""
            className="h-7 w-7 rounded-full"
            src={authState.user.avatarUrl}
          />
        ) : (
          <GitBranch className="h-5 w-5" />
        )}
        <span className="max-w-28 truncate">{authState.user.username}</span>
      </div>
    );
  }

  return (
    <DuoButton
      icon={<GitBranch className="h-5 w-5" />}
      onClick={() => {
        window.location.href = "/api/auth/login";
      }}
      size="sm"
      variant="grey"
    >
      Sign in
    </DuoButton>
  );
}
