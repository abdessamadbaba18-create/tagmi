"use client";

import { cn } from "@/lib/utils";
import { Check, type LucideIcon } from "lucide-react";

export interface WizardStep {
  title: string;
  subtitle: string;
  icon: LucideIcon;
}

interface StepperProps {
  steps: WizardStep[];
  currentStep: number;
  onStepClick?: (index: number) => void;
  className?: string;
}

export function Stepper({ steps, currentStep, onStepClick, className }: StepperProps) {
  return (
    <div className={cn("w-full", className)}>
      {/* Mobile horizontal tracker */}
      <div className="flex items-center lg:hidden">
        {steps.map((step, i) => {
          const over = i < currentStep;
          const active = i === currentStep;
          const reachable = i <= currentStep;
          return (
            <div key={step.title} className="flex flex-1 items-center last:flex-none">
              <button
                type="button"
                disabled={!reachable}
                onClick={() => onStepClick?.(i)}
                aria-label={step.title}
                className={cn(
                  "relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300",
                  over && "bg-gradient-to-br from-gold to-gold-light text-white",
                  active &&
                    "bg-ink text-gold-light ring-2 ring-gold/40 isolate",
                  !over && !active && "bg-stone-100 text-stone-400"
                )}
              >
                {over ? (
                  <Check className="h-4 w-4 animate-stepper-pop" />
                ) : (
                  <step.icon className="h-4 w-4" />
                )}
                {active && (
                  <span className="absolute inset-0 -z-10 animate-node-pulse rounded-full" />
                )}
              </button>
              {i < steps.length - 1 && (
                <div
                  className={cn(
                    "mx-1 h-0.5 flex-1 rounded-full transition-colors duration-500",
                    i < currentStep ? "bg-gold" : "bg-stone-200"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Desktop vertical rail */}
      <div className="relative hidden lg:block">
        <div className="absolute bottom-1 left-[15.5px] top-1 w-px bg-stone-200" />
        <div
          className="absolute left-[15.5px] top-1 w-px bg-gradient-to-b from-gold to-gold-light transition-all duration-500"
          style={{
            height: `${Math.max(
              0,
              Math.min(100, (currentStep / Math.max(1, steps.length - 1)) * 100)
            )}%`,
          }}
        />
        <div className="relative space-y-1.5">
          {steps.map((step, i) => {
            const over = i < currentStep;
            const active = i === currentStep;
            const reachable = i <= currentStep;
            return (
              <button
                key={step.title}
                type="button"
                disabled={!reachable}
                onClick={() => onStepClick?.(i)}
                className={cn(
                  "group flex w-full items-start gap-3.5 rounded-2xl px-2.5 py-2.5 text-left transition-all duration-300",
                  active && "bg-gradient-to-r from-gold/10 to-transparent",
                  !active && !over && "cursor-default hover:bg-stone-50",
                  !active && over && "hover:bg-stone-50"
                )}
              >
                <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border isolate">
                  {over ? (
                    <span className="flex h-full w-full animate-stepper-pop items-center justify-center rounded-full bg-gradient-to-br from-gold to-gold-light text-white">
                      <Check className="h-4 w-4" />
                    </span>
                  ) : active ? (
                    <span className="flex h-full w-full animate-stepper-pop items-center justify-center rounded-full bg-ink text-gold-light ring-2 ring-gold/40">
                      <step.icon className="h-4 w-4" />
                      <span className="absolute inset-0 -z-10 animate-node-pulse rounded-full" />
                    </span>
                  ) : (
                    <span className="flex h-full w-full items-center justify-center rounded-full bg-white text-stone-300 transition-colors group-hover:border-gold/40 group-hover:text-gold">
                      <step.icon className="h-4 w-4" />
                    </span>
                  )}
                </span>
                <span className="flex min-w-0 flex-col pt-1.5">
                  <span
                    className={cn(
                      "text-sm font-semibold transition-colors",
                      active ? "text-gold" : "text-stone-700"
                    )}
                  >
                    {step.title}
                  </span>
                  <span className="truncate text-xs text-stone-400">
                    {step.subtitle}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}