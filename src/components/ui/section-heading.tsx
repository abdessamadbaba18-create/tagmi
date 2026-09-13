"use client";

import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
}

export function SectionHeading({
  title,
  subtitle,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-8",
        align === "center" && "text-center",
        className
      )}
    >
      <h2 className="font-display text-2xl font-bold text-gray-900 md:text-3xl">
        {title}
      </h2>
      {subtitle && (
        <p
          className={cn(
            "mt-2 text-gray-600",
            align === "center" && "mx-auto max-w-xl"
          )}
        >
          {subtitle}
        </p>
      )}
      <div
        className={cn(
          "mt-3 flex items-center gap-1",
          align === "center" && "justify-center"
        )}
      >
        <span className="h-[3px] w-10 rounded-full bg-gradient-to-r from-gold to-gold-light" />
        <span className="h-[3px] w-2 rounded-full bg-gold/40" />
        <span className="h-[3px] w-1 rounded-full bg-gold/20" />
      </div>
    </div>
  );
}