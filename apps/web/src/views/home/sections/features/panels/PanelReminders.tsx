"use client";

import {
  REMINDER_STATS,
  REMINDERS_QUEUE,
} from "../constants/features.constants";

export function PanelReminders() {
  return (
    <div className="flex flex-col gap-4 font-sans h-full">
      {/* Reminders stats grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {REMINDER_STATS.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border/40 bg-background/40 p-3 text-center"
          >
            <p className="text-sm sm:text-base font-extrabold text-foreground tracking-tight leading-none">
              {stat.val}
            </p>
            <p className="text-[8.5px] font-bold text-muted-foreground mt-1 uppercase tracking-wider leading-none">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Queue section */}
      <div className="rounded-2xl bg-background/40 p-4 border border-border/40 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
            Upcoming Queue
          </p>
          <span className="inline-flex items-center gap-1 rounded bg-accent px-2 py-0.5 text-[9px] font-bold text-primary">
            <span>Auto</span>
          </span>
        </div>

        {/* Reminders List */}
        <div className="space-y-2 overflow-y-auto pr-0.5 max-h-[195px] scrollbar-thin">
          {REMINDERS_QUEUE.map((item, idx) => {
            const isSMS = item.type === "SMS";

            return (
              <div
                key={idx}
                className="flex items-start gap-3 bg-surface p-3 rounded-xl border border-border/40 shadow-md hover:border-primary/20 hover:translate-x-0.5 transition duration-200"
              >
                <span
                  className={`rounded px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase leading-none mt-0.5 shrink-0 ${
                    isSMS
                      ? "bg-info-surface text-info-surface-foreground border border-info-border"
                      : "bg-primary/10 text-primary border border-primary/15"
                  }`}
                >
                  {item.type}
                </span>
                <div className="min-w-0 flex-1">
                  <h6 className="font-extrabold text-foreground text-[11.5px] leading-tight">
                    {item.name}
                  </h6>
                  <p className="text-[9px] text-muted-foreground mt-0.5 leading-relaxed break-words">
                    {item.msg}
                  </p>
                </div>
                <span className="text-[8.5px] font-bold text-muted-foreground tracking-tight shrink-0 font-mono mt-0.5 ml-1">
                  {item.time}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
