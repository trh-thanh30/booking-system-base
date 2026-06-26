"use client";

import { useLiveBookings } from "../hooks/useLiveBookings";

export function PanelBookings() {
  const { bookings } = useLiveBookings();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[14px] font-bold text-text-primary">
          Today&apos;s bookings
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-[12.5px] font-bold text-emerald-700 animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Live syncing
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {bookings.map((b, i) => {
          const isNew = i === 0 && b._new;
          return (
            <div
              key={b.id}
              className={`grid grid-cols-[70px_1fr_auto_auto] items-center gap-4 rounded-xl border p-3 transition-all duration-300 ${
                isNew
                  ? "border-success-border bg-success-bg border-l-4 border-l-success animate-row-in shadow-sm"
                  : "border-border-light bg-bg-secondary"
              }`}
            >
              <div className="text-[13.5px] font-bold text-text-primary tabular-nums">
                {b.time}
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-text-primary truncate">
                  {b.name}
                </div>
                <div className="mt-0.5 text-[11.5px] text-text-muted truncate">
                  {b.svc}
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-border-light bg-bg-primary px-2.5 py-0.5 text-[11px] font-semibold text-text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {b.status}
              </div>
              <div className="min-w-[50px] text-right text-[13.5px] font-bold text-text-primary tabular-nums">
                ${b.amount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
