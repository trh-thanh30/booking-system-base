"use client";

import { REMINDER_STATS, REMINDERS_QUEUE } from "../features.constants";

export function PanelReminders() {
  return (
    <div className="flex flex-col gap-4 font-sans h-full">
      {/* Reminders stats grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {REMINDER_STATS.map((stat, idx) => (
          <div
            key={idx}
            className="rounded-2xl border border-border-light/40 bg-bg-secondary/40 p-3 text-center"
          >
            <p className="text-sm sm:text-base font-extrabold text-text-primary tracking-tight leading-none">
              {stat.val}
            </p>
            <p className="text-[8.5px] font-bold text-text-muted mt-1 uppercase tracking-wider leading-none">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      {/* Queue section */}
      <div className="rounded-2xl bg-bg-secondary/40 p-4 border border-border-light/40 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-3 shrink-0">
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted">
            Upcoming Queue
          </p>
          <span className="inline-flex items-center gap-1 rounded bg-[#E5F0FF] px-2 py-0.5 text-[9px] font-bold text-brand-blue">
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
                className="flex items-start gap-3 bg-bg-primary p-3 rounded-xl border border-border-light/40 shadow-[0_1px_2px_rgba(0,0,0,0.01)] hover:border-brand-blue/20 hover:translate-x-0.5 transition duration-200"
              >
                <span
                  className={`rounded px-1.5 py-0.5 text-[8.5px] font-extrabold uppercase leading-none mt-0.5 shrink-0 ${
                    isSMS
                      ? "bg-purple-50 text-purple-600 border border-purple-100"
                      : "bg-brand-blue/10 text-brand-blue border border-brand-blue/15"
                  }`}
                >
                  {item.type}
                </span>
                <div className="min-w-0 flex-1">
                  <h6 className="font-extrabold text-text-primary text-[11.5px] leading-tight">
                    {item.name}
                  </h6>
                  <p className="text-[9px] text-text-muted mt-0.5 leading-relaxed break-words">
                    {item.msg}
                  </p>
                </div>
                <span className="text-[8.5px] font-bold text-text-muted tracking-tight shrink-0 font-mono mt-0.5 ml-1">
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
