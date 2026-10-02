"use client";

import { useEffect, useState } from "react";
import type { StepData, Mode } from "./types/NoShowSection.types";

interface Props {
  steps: StepData[];
  activeStep: number;
  mode: Mode;
}

const BADGE_STYLES = {
  success: "bg-success-bg text-success-surface-foreground",
  info: "bg-primary/10 text-primary",
  warning: "bg-warning-bg text-warning-surface-foreground",
  danger: "bg-danger-bg text-danger-surface-foreground",
} as const;

export function Timeline({ steps, activeStep, mode }: Props) {
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    setProgressPct(activeStep > 0 ? (activeStep / 4) * 100 : 0);
  }, [activeStep]);

  const progressColor = mode === "with" ? "bg-success" : "bg-danger";
  const dotActive =
    mode === "with"
      ? "bg-success border-success animate-pulse-success"
      : "bg-danger border-danger animate-pulse-danger";
  const dotGlow =
    mode === "with" ? "ring-4 ring-success/20" : "ring-4 ring-danger/20";

  return (
    <div className="relative pl-7">
      <div className="absolute left-[7px] top-3.5 bottom-3.5 w-0.5 bg-border" />
      <div
        className={`absolute left-[7px] top-3.5 w-0.5 ${progressColor} transition-all duration-[400ms] ease-out`}
        style={{
          height: progressPct > 0 ? `calc(${progressPct}% - 14px)` : "0",
        }}
      />

      {steps.map((step) => {
        const isActive = step.stepNumber <= activeStep;
        return (
          <div
            key={step.stepNumber}
            className={`relative py-3 transition-opacity duration-[400ms] ${isActive ? "opacity-100" : "opacity-35"}`}
          >
            <div
              className={`absolute -left-7 top-[18px] h-4 w-4 rounded-full border-2 bg-surface transition-all duration-300 ${
                isActive ? `${dotActive} ${dotGlow}` : "border-input"
              }`}
            />

            <div
              className={`rounded-xl border p-3 transition-all duration-300 ${
                isActive
                  ? mode === "with"
                    ? "bg-surface border-success-border shadow-md"
                    : "bg-surface border-danger-border shadow-md"
                  : "bg-background border-border"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] font-bold text-muted-foreground tracking-[0.04em]">
                  {step.time}
                </span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-muted-foreground">
                  {step.type}
                </span>
                <span
                  className={`ml-auto inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-all duration-300 ${
                    isActive
                      ? "translate-x-0 opacity-100"
                      : "translate-x-2 opacity-0"
                  } ${BADGE_STYLES[step.badgeVariant]}`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  {step.badge}
                </span>
              </div>
              <div className="text-[14px] font-semibold leading-tight">
                {step.title}
              </div>
              <div className="mt-1 text-[12.5px] text-muted-foreground">
                {step.meta}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
