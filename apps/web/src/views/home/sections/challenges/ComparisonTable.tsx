"use client";

import type { ComparisonPair, ChallengeId } from "./Challenges.types";

interface Props {
  comparisons: ComparisonPair[];
  activeId: ChallengeId | null;
  onSelect: (id: ChallengeId) => void;
}

export function ComparisonTable({ comparisons, activeId, onSelect }: Props) {
  return (
    <div className="grid gap-6 md:grid-cols-2 select-none font-sans">
      {/* Left Column: Manual Scheduling */}
      <div className="rounded-3xl border border-border-light bg-bg-primary p-7 sm:p-8 shadow-sm lg:min-h-[500px] flex flex-col">
        <div className="mb-6 flex items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-text-muted">
          <span className="h-2 w-2 rounded-full bg-text-muted animate-pulse" />
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
                    ? "bg-red-50/20 border-red-500/30 shadow-sm scale-[1.01]"
                    : "bg-bg-secondary border-border-light/40 hover:border-border-gray/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 flex-shrink-0 ${
                      isActive
                        ? "bg-red-500 border-red-500 scale-110 shadow-[0_0_0_3px_rgba(239,68,68,0.2)]"
                        : "bg-border-light border-border-light"
                    }`}
                  />
                  <div className="text-[14px] font-semibold text-text-primary flex-1 lg:whitespace-nowrap">
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
                    <div className="bg-bg-primary rounded-lg border-l-2 border-red-500 px-3 py-2 text-[12.5px] leading-relaxed text-text-muted shadow-sm flex items-start gap-1.5">
                      <span className="flex-shrink-0 text-red-500 font-semibold">
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
            ? "border-brand-blue ring-1 ring-brand-blue/10 bg-gradient-to-b from-bg-primary to-[#006aff]/2"
            : "border-border-light bg-bg-primary"
        }`}
      >
        <div className="mb-6 flex items-center gap-2.5 text-[11.5px] font-bold uppercase tracking-[0.08em] text-brand-blue">
          <span className="h-2 w-2 rounded-full bg-brand-blue animate-pulse" />
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
                    ? "bg-brand-blue/5 border-brand-blue shadow-sm scale-[1.01]"
                    : "bg-bg-secondary border-border-light/40 hover:border-border-gray/30"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-2.5 w-2.5 rounded-full border transition-all duration-300 flex-shrink-0 ${
                      isActive
                        ? "bg-brand-blue border-brand-blue scale-110 shadow-[0_0_0_3px_rgba(0,106,255,0.2)]"
                        : "bg-border-light border-border-light"
                    }`}
                  />
                  <div
                    className={`text-[14px] font-semibold flex-1 transition-colors lg:whitespace-nowrap ${isActive ? "text-brand-blue font-bold" : "text-text-primary"}`}
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
                    <div className="bg-bg-primary rounded-lg border-l-2 border-brand-blue px-3 py-2 text-[12.5px] leading-relaxed text-text-muted shadow-sm flex items-start gap-1.5">
                      <span className="flex-shrink-0 text-brand-blue font-semibold">
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
