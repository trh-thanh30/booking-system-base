"use client";

import {
  AVAILABILITY_DAYS,
  AVAILABILITY_HOURS,
  AVAILABILITY_SLOTS,
  AVAILABILITY_LEGENDS,
  AVAILABILITY_RULES,
} from "../constants/features.constants";

export function PanelAvailability() {
  return (
    <div className="flex flex-col gap-4 font-sans h-full">
      {/* Calendar Grid */}
      <div className="rounded-2xl bg-background/40 p-4 border border-border/40 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Week View — Open Slots
          </p>
          <div className="flex items-center gap-2.5">
            {AVAILABILITY_LEGENDS.map((legend, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <span
                  className={`w-2.5 h-2.5 rounded border ${legend.color}`}
                />
                <span className="text-[9px] font-bold text-muted-foreground">
                  {legend.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-[45px_repeat(5,1fr)] gap-1 text-[9.5px] font-bold overflow-y-auto max-h-[195px] pr-0.5 scrollbar-thin">
          {/* Header Row */}
          <div className="h-6 flex items-center justify-end pr-2 text-muted-foreground">
            Time
          </div>
          {AVAILABILITY_DAYS.map((d, i) => (
            <div
              key={i}
              className="h-6 flex items-center justify-center text-muted-foreground bg-surface/50 rounded-md border border-border/20"
            >
              {d}
            </div>
          ))}

          {/* Time Rows */}
          {AVAILABILITY_HOURS.map((h, rowIdx) => {
            return (
              <div key={rowIdx} className="contents">
                {/* Time Label */}
                <div className="h-6 flex items-center justify-end pr-2 text-muted-foreground font-mono leading-none">
                  {h}:00
                </div>

                {/* Day Slots */}
                {AVAILABILITY_DAYS.map((_, colIdx) => {
                  const stateIdx =
                    (rowIdx * 5 + colIdx) % AVAILABILITY_SLOTS.length;
                  const state = AVAILABILITY_SLOTS[stateIdx];
                  const stateClass =
                    state === "available"
                      ? "bg-success-500/10 border-success-500/25 hover:bg-success-500/20 hover:scale-[1.03]"
                      : state === "buffer"
                        ? "bg-warning-500/10 border-warning-500/25 hover:bg-warning-500/15 hover:scale-[1.03]"
                        : "bg-danger-500/5 border-danger-500/15 hover:bg-danger-500/10";

                  return (
                    <div
                      key={colIdx}
                      className={`h-6 rounded border transition-all duration-150 cursor-pointer ${stateClass}`}
                      title={`${h}:00 slot (${state})`}
                    />
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Booking Rules */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0">
        {AVAILABILITY_RULES.map((rule, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border/40 bg-background/40 p-3 flex flex-col justify-between"
          >
            <span className="text-[8.5px] font-bold uppercase tracking-wider text-muted-foreground leading-none">
              {rule.label}
            </span>
            <span className="mt-1.5 text-xs font-extrabold text-foreground tracking-tight leading-none">
              {rule.val}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
