"use client";

import type { ComparisonPair, ChallengeId } from "./types/Challenges.types";

interface Props {
  comparisons: ComparisonPair[];
  activeId: ChallengeId | null;
  onSelect: (id: ChallengeId) => void;
}

export function ComparisonTable({ comparisons, activeId, onSelect }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 select-none font-sans">
      {/* Left Column: Manual Scheduling */}
      <div className="rounded-3xl border border-border bg-surface p-7 sm:p-8 shadow-sm lg:min-h-[500px] flex flex-col">
        <div className="mb-6 flex items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-muted-foreground">
          <span className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
          Manual scheduling
        </div>
        <div className="space-y-3 flex-1 flex flex-col justify-start">
          {comparisons.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full text-left rounded-2xl border p-4.5 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-danger-surface/20 border-danger-500/30 shadow-sm scale-[1.01]"
                    : "bg-background border-border/40 hover:border-input/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 flex-shrink-0 ${
                      isActive
                        ? "bg-danger-500 border-danger-500 scale-110 shadow-md"
                        : "bg-border border-border"
                    }`}
                  />
                  <div className="text-[14px] font-semibold text-foreground flex-1 lg:whitespace-nowrap">
                    {item.manualText}
                  </div>
                </div>

                {/* Explanation Tooltip */}
                <div
                  className={`grid transition-all duration-300 ease-out overflow-hidden ${
                    isActive
                      ? "grid-rows-[1fr] opacity-100 mt-2.5"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="bg-surface rounded-lg border-l-2 border-danger-500 px-3 py-2 text-[12.5px] leading-relaxed text-muted-foreground shadow-sm flex items-start gap-1.5">
                      <span className="flex-shrink-0 text-danger-500 font-semibold">
                        →
                      </span>
                      <span>{item.manualExplain}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: With Booking System */}
      <div
        className={`rounded-3xl border p-7 sm:p-8 transition-all duration-300 shadow-sm lg:min-h-[500px] flex flex-col ${
          activeId
            ? "border-primary ring-1 ring-primary/10 bg-gradient-to-b from-surface to-primary/2"
            : "border-border bg-surface"
        }`}
      >
        <div className="mb-6 flex items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-primary">
          <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          With booking system
        </div>
        <div className="space-y-3 flex-1 flex flex-col justify-start">
          {comparisons.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelect(item.id)}
                className={`w-full text-left rounded-2xl border p-4.5 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? "bg-primary/5 border-primary shadow-sm scale-[1.01]"
                    : "bg-background border-border/40 hover:border-input/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 flex-shrink-0 ${
                      isActive
                        ? "bg-primary border-primary scale-110 shadow-md"
                        : "bg-border border-border"
                    }`}
                  />
                  <div
                    className={`text-[14px] font-semibold flex-1 transition-colors lg:whitespace-nowrap ${isActive ? "text-primary font-bold" : "text-foreground"}`}
                  >
                    {item.systemText}
                  </div>
                </div>

                {/* Explanation Tooltip */}
                <div
                  className={`grid transition-all duration-300 ease-out overflow-hidden ${
                    isActive
                      ? "grid-rows-[1fr] opacity-100 mt-2.5"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="bg-surface rounded-lg border-l-2 border-primary px-3 py-2 text-[12.5px] leading-relaxed text-muted-foreground shadow-sm flex items-start gap-1.5">
                      <span className="flex-shrink-0 text-primary font-semibold">
                        →
                      </span>
                      <span>{item.systemExplain}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
