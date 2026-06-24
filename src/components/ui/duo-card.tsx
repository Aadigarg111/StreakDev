import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type DuoCardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: "snow" | "panel" | "success" | "info" | "warning" | "danger";
};

const toneClasses: Record<NonNullable<DuoCardProps["tone"]>, string> = {
  snow: "border-duo-swan bg-duo-snow",
  panel: "border-duo-swan bg-duo-grey-panel",
  success: "border-duo-green bg-[#F1FFE8]",
  info: "border-duo-blue bg-[#EFF9FF]",
  warning: "border-duo-yellow bg-[#FFF9D8]",
  danger: "border-duo-red bg-[#FFF0F0]",
};

export function DuoCard({
  className,
  tone = "snow",
  ...props
}: DuoCardProps) {
  return (
    <div
      className={cn(
        "rounded-duo-lg border-2 p-5 text-duo-eel",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
