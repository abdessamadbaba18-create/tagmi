"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminPageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  accent?: string;
  children?: React.ReactNode;
}

export function AdminPageHeader({
  icon: Icon,
  title,
  subtitle,
  accent = "from-gold to-gold-light",
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-7 text-white shadow-lg">
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(202,138,4,0.35) 0%, transparent 45%), linear-gradient(135deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "auto, 28px 28px",
        }}
      />
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gold/25 blur-[70px]" />
      <div className="pointer-events-none absolute -bottom-16 -left-8 h-32 w-32 rounded-full bg-gold-light/10 blur-[50px]" />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            className={cn(
              "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-ink shadow-lg shadow-gold/30",
              accent
            )}
          >
            <Icon className="h-6 w-6" />
          </span>
          <div>
            <h1 className="font-display text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-white/50">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}