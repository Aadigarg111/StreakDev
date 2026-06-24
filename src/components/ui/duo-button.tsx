import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type DuoButtonVariant = "green" | "blue" | "red" | "yellow" | "purple" | "grey";
type DuoButtonSize = "sm" | "md" | "lg" | "icon";

type DuoButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: DuoButtonVariant;
  size?: DuoButtonSize;
  icon?: ReactNode;
};

const variantClasses: Record<DuoButtonVariant, string> = {
  green: "border-duo-green-dark bg-duo-green text-white",
  blue: "border-duo-blue-dark bg-duo-blue text-white",
  red: "border-duo-red-dark bg-duo-red text-white",
  yellow: "border-duo-yellow-dark bg-duo-yellow text-duo-eel",
  purple: "border-[#B35DEB] bg-duo-purple text-white",
  grey: "border-duo-grey-border bg-duo-grey-panel text-duo-grey-text",
};

const sizeClasses: Record<DuoButtonSize, string> = {
  sm: "min-h-10 px-4 text-sm",
  md: "min-h-12 px-5 text-base",
  lg: "min-h-14 px-7 text-lg",
  icon: "h-12 w-12 p-0",
};

export function DuoButton({
  className,
  variant = "green",
  size = "md",
  icon,
  children,
  disabled,
  type = "button",
  ...props
}: DuoButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-duo border-x-0 border-t-0 border-b-4 font-black uppercase tracking-normal",
        "transition-[transform,border-bottom-width,filter] duration-75 ease-out",
        "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-duo-blue/25",
        "active:translate-y-1 active:border-b-0",
        "disabled:translate-y-0 disabled:cursor-not-allowed disabled:border-b-4 disabled:border-duo-grey-border disabled:bg-duo-grey-panel disabled:text-duo-grey-disabled",
        "disabled:active:translate-y-0 disabled:active:border-b-4",
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
      disabled={disabled}
      type={type}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
