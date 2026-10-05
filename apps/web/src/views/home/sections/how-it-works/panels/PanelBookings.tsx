"use client";

import { useLiveBookings } from "../hooks/useLiveBookings";

export function PanelBookings() {
  const { bookings } = useLiveBookings();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[14px] font-bold text-foreground">
          Today&apos;s bookings
        </div>
        <div className="inline-flex items-center gap-1.5 rounded-full bg-success-bg px-3 py-1 text-[12.5px] font-bold text-success-surface-foreground animate-pulse">
          <span className="h-1.5 w-1.5 rounded-full bg-success-500" />
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
                  : "border-border bg-background"
              }`}
            >
              <div className="text-[13.5px] font-bold text-foreground tabular-nums">
                {b.time}
              </div>
              <div className="min-w-0">
                <div className="text-[13.5px] font-bold text-foreground truncate">
                  {b.name}
                </div>
                <div className="mt-0.5 text-[11.5px] text-muted-foreground truncate">
                  {b.svc}
                </div>
              </div>
              <div className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-0.5 text-[11px] font-semibold text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {b.status}
              </div>
              <div className="min-w-[50px] text-right text-[13.5px] font-bold text-foreground tabular-nums">
                ${b.amount}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
