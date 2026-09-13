"use client";

import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  children,
  className,
}: PageHeaderProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden bg-ink text-white",
        className
      )}
    >
      {/* Zellige grid overlay */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(45deg, rgba(202,138,4,0.05) 1px, transparent 1px)",
          backgroundSize: "80px 80px, 80px 80px, 40px 40px",
        }}
        aria-hidden="true"
      />

      {/* Radial gold glow */}
      <div
        className="absolute -top-24 right-0 h-72 w-72 rounded-full bg-gold/20 blur-[100px]"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-gold-light/10 blur-[90px]"
        aria-hidden="true"
      />

      <div className="relative container mx-auto px-4 py-16">
        <div className="max-w-2xl">
          {badge && (
            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-gold-light">
              <Sparkles className="h-3.5 w-3.5" />
              {badge}
            </span>
          )}

          <h1 className="font-display text-3xl font-bold leading-tight text-white md:text-5xl">
            {title}
          </h1>

          {subtitle && (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
              {subtitle}
            </p>
          )}

          {children}
        </div>
      </div>

      {/* Bottom accent */}
      <div className="relative h-1 w-full bg-gradient-to-r from-gold via-gold-light to-transparent" />
    </section>
  );
}