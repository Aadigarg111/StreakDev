"use client";

import {
  Atom,
  Binary,
  Boxes,
  Braces,
  CodeXml,
  Coffee,
  Cpu,
  Database,
  DatabaseZap,
  FileCode,
  FileCode2,
  GitBranch,
  LucideIcon,
  Network,
  Router,
  Server,
  Sigma,
  Terminal,
  Workflow,
} from "lucide-react";
import type { Track } from "../../../types/content";
import { cn } from "@/lib/cn";

const icons: Record<string, LucideIcon> = {
  atom: Atom,
  binary: Binary,
  boxes: Boxes,
  braces: Braces,
  "code-xml": CodeXml,
  coffee: Coffee,
  cpu: Cpu,
  database: Database,
  "database-zap": DatabaseZap,
  "file-code": FileCode,
  "file-code-2": FileCode2,
  "git-branch": GitBranch,
  network: Network,
  router: Router,
  server: Server,
  sigma: Sigma,
  terminal: Terminal,
  workflow: Workflow,
};

type TrackCardProps = {
  track: Track;
  selected?: boolean;
  onClick?: () => void;
};

export function TrackCard({ track, selected, onClick }: TrackCardProps) {
  const Icon = icons[track.icon] ?? FileCode;

  return (
    <button
      aria-pressed={selected}
      className={cn(
        "touch-target no-select-interactive group flex min-h-[64px] w-full items-center gap-4 rounded-duo border-2 bg-duo-snow px-4 py-3 text-left transition",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
        "active:translate-y-1",
        selected
          ? "border-duo-green bg-[#F1FFE8]"
          : "border-duo-swan hover:border-duo-green",
      )}
      onClick={onClick}
      type="button"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border-b-4 text-white"
        style={{
          backgroundColor: track.color,
          borderColor: "rgb(75 75 75 / 0.18)",
        }}
      >
        <Icon className="h-7 w-7" />
      </span>
      <span className="min-w-0 flex-1">
        <span
          className={cn(
            "block truncate text-lg font-black",
            selected ? "text-duo-green-dark" : "text-duo-eel",
          )}
        >
          {track.title}
        </span>
        <span className="block truncate text-xs font-black uppercase text-duo-grey-disabled">
          {track.sections.length} sections -{" "}
          {track.sections.reduce((sum, section) => sum + section.units.length, 0)} units
        </span>
      </span>
      <span
        aria-hidden
        className={cn(
          "grid h-7 w-7 shrink-0 place-items-center rounded-full border-2",
          selected
            ? "border-duo-green bg-duo-green text-white"
            : "border-duo-swan bg-duo-grey-panel text-transparent",
        )}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-current" />
      </span>
    </button>
  );
}
