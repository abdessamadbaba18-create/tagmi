import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "gold"
  | "green"
  | "red"
  | "amber"
  | "sky"
  | "stone"
  | "outline"
  | "dark";

const badgeVariants: Record<BadgeVariant, string> = {
  gold: "border-transparent bg-gold/10 text-gold",
  green: "border-transparent bg-emerald-100 text-emerald-700",
  red: "border-transparent bg-red-100 text-red-700",
  amber: "border-transparent bg-amber-100 text-amber-700",
  sky: "border-transparent bg-sky-100 text-sky-700",
  stone: "border-transparent bg-stone-100 text-stone-600",
  outline: "border border-stone-200 bg-white text-stone-600",
  dark: "border-transparent bg-ink text-white",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

function Badge({ className, variant = "gold", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };