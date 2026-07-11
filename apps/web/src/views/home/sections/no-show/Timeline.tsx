"use client";

import { useEffect, useState } from "react";
import type { StepData, Mode } from "./NoShowSection.types";

interface Props {
  steps: StepData[];
  activeStep: number;
  mode: Mode;
}

const BADGE_STYLES = {
  success: "bg-success-bg text-emerald-700",
  info: "bg-brand-blue/10 text-brand-blue",
  warning: "bg-warning-bg text-amber-700",
  danger: "bg-danger-bg text-red-700",
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
    mode === "with"
      ? "shadow-[0_0_0_4px_var(--color-success-bg)]"
      : "shadow-[0_0_0_4px_var(--color-danger-bg)]";

  return (
    <div className="relative pl-7">
      <div className="absolute left-[7px] top-3.5 bottom-3.5 w-0.5 bg-border-light" />
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
              className={`absolute -left-7 top-[18px] h-4 w-4 rounded-full border-2 bg-bg-primary transition-all duration-300 ${
                isActive ? `${dotActive} ${dotGlow}` : "border-border-gray"
              }`}
            />

            <div
              className={`rounded-xl border p-3 transition-all duration-300 ${
                isActive
                  ? mode === "with"
                    ? "bg-bg-primary border-success-border shadow-[0_2px_12px_rgba(16,185,129,0.08)]"
                    : "bg-bg-primary border-danger-border shadow-[0_2px_12px_rgba(239,68,68,0.08)]"
                  : "bg-bg-secondary border-border-light"
              }`}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="text-[11.5px] font-bold text-text-muted tracking-[0.04em]">
                  {step.time}
                </span>
                <span className="text-[10.5px] font-bold uppercase tracking-[0.06em] text-text-muted">
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
              <div className="mt-1 text-[12.5px] text-text-muted">
                {step.meta}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
