"use client";

import {
  ChevronRight,
  ListChecks,
  CalendarClock,
  Link2,
  LayoutGrid,
} from "lucide-react";
import type { StepMeta, StepId } from "./HowItWorksSection.types";

const ICON_MAP = {
  list: ListChecks,
  calendar: CalendarClock,
  link: Link2,
  grid: LayoutGrid,
};

interface Props {
  steps: StepMeta[];
  activeStep: StepId;
  onSelect: (id: StepId) => void;
}

export function StepList({ steps, activeStep, onSelect }: Props) {
  return (
    <div className="flex flex-col gap-3 font-sans">
      {steps.map((step) => {
        const Icon = ICON_MAP[step.icon];
        const isActive = step.id === activeStep;

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onSelect(step.id)}
            className={`group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 overflow-hidden rounded-2xl border bg-bg-primary p-4 text-left transition-all duration-200 sm:p-5 cursor-pointer ${
              isActive
                ? "border-brand-blue bg-gradient-to-r from-brand-blue/5 to-white shadow-[0_0_0_3px_rgba(0,106,255,0.08)]"
                : "border-border-light hover:translate-x-0.5 hover:border-border-gray/60"
            }`}
          >
            {/* Active left bar */}
            <span
              className={`absolute left-0 top-0 bottom-0 w-[3px] bg-brand-blue transition-transform duration-300 ${
                isActive ? "scale-y-100" : "scale-y-0"
              }`}
            />

            <div className="flex flex-col items-center gap-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg text-[12px] font-bold transition-colors ${
                  isActive
                    ? "bg-brand-blue text-white"
                    : "bg-bg-secondary text-text-primary"
                }`}
              >
                {step.number}
              </div>
            </div>

            <div className="min-w-0">
              <div className="mb-1 text-[15px] font-bold text-text-primary tracking-[-0.01em]">
                {step.title}
              </div>
              <div className="text-[12.5px] leading-[1.5] text-text-muted">
                {step.desc}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                  isActive
                    ? "bg-brand-blue text-white"
                    : "bg-brand-blue/10 text-brand-blue"
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>

              <ChevronRight
                className={`hidden h-5 w-5 transition-all sm:block ${
                  isActive
                    ? "translate-x-0.5 text-brand-blue"
                    : "text-border-light group-hover:text-text-muted"
                }`}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
