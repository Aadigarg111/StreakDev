"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

type BityPose = "idle" | "greeting" | "confident" | "celebrating" | "sad" | "sleeping";

type BityProps = {
  pose?: BityPose;
  className?: string;
  label?: string;
};

const poseTilt: Record<BityPose, number> = {
  idle: 0,
  greeting: -4,
  confident: 3,
  celebrating: -8,
  sad: 6,
  sleeping: -10,
};

export function Bity({ pose = "idle", className, label = "Bity mascot" }: BityProps) {
  const reducedMotion = useReducedMotion();
  const isSad = pose === "sad";
  const isSleeping = pose === "sleeping";
  const isCelebrating = pose === "celebrating";

  return (
    <motion.svg
      aria-label={label}
      className={cn("h-32 w-32 drop-shadow-sm", className)}
      role="img"
      viewBox="0 0 160 160"
      animate={
        reducedMotion
          ? undefined
          : {
              rotate: poseTilt[pose],
              y: isCelebrating ? [0, -8] : [0, -2],
            }
      }
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        repeat: reducedMotion ? 0 : Infinity,
        repeatDelay: 1.6,
        repeatType: "mirror",
      }}
    >
      <title>{label}</title>
      <path
        d="M31 74c0-32 20-56 49-56s49 24 49 56v22c0 30-19 48-49 48S31 126 31 96V74Z"
        fill="#58CC02"
      />
      <path
        d="M43 79c-15 5-25 17-25 31 21 0 34-9 40-25L43 79Z"
        fill="#4CAA00"
      />
      <path
        d="M117 79c15 5 25 17 25 31-21 0-34-9-40-25l15-6Z"
        fill="#4CAA00"
      />
      <path
        d="M54 105c5 16 14 24 26 24s21-8 26-24c-7 4-16 6-26 6s-19-2-26-6Z"
        fill="#D9FFBE"
      />
      <circle cx="59" cy="65" r="24" fill="#FFFFFF" />
      <circle cx="101" cy="65" r="24" fill="#FFFFFF" />
      {isSleeping ? (
        <>
          <path d="M47 65c7-6 16-6 24 0" fill="none" stroke="#4B4B4B" strokeLinecap="round" strokeWidth="5" />
          <path d="M89 65c7-6 16-6 24 0" fill="none" stroke="#4B4B4B" strokeLinecap="round" strokeWidth="5" />
        </>
      ) : (
        <>
          <circle cx={isSad ? 63 : 59} cy={isSad ? 70 : 65} r="9" fill="#4B4B4B" />
          <circle cx={isSad ? 97 : 101} cy={isSad ? 70 : 65} r="9" fill="#4B4B4B" />
          <circle cx={isSad ? 66 : 62} cy={isSad ? 67 : 62} r="3" fill="#FFFFFF" />
          <circle cx={isSad ? 100 : 104} cy={isSad ? 67 : 62} r="3" fill="#FFFFFF" />
        </>
      )}
      <path d="M73 82h14l-7 10-7-10Z" fill="#FFC800" />
      <path
        d={isSad ? "M65 105c9-8 21-8 30 0" : "M63 101c10 10 24 10 34 0"}
        fill="none"
        stroke="#4B4B4B"
        strokeLinecap="round"
        strokeWidth="5"
      />
      {pose === "greeting" && (
        <path
          d="M119 44c13-12 25-11 32-2"
          fill="none"
          stroke="#1CB0F6"
          strokeLinecap="round"
          strokeWidth="6"
        />
      )}
      {isCelebrating && (
        <>
          <circle cx="28" cy="32" r="5" fill="#FFC800" />
          <circle cx="132" cy="29" r="5" fill="#CE82FF" />
          <path d="M22 55h16" stroke="#1CB0F6" strokeLinecap="round" strokeWidth="5" />
          <path d="M122 51h16" stroke="#FF4B4B" strokeLinecap="round" strokeWidth="5" />
        </>
      )}
      {isSleeping && (
        <text fill="#1CB0F6" fontSize="18" fontWeight="900" x="112" y="35">
          Zz
        </text>
      )}
    </motion.svg>
  );
}
