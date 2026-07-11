"use client";

import React, { useState } from "react";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const TIMES = ["09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
const INITIAL = [1, 0, 1, 0, 1, 0, 1] as const;

type State = "" | "available" | "blocked";
const CYCLE: State[] = ["", "available", "blocked"];

export function PanelAvailability() {
  const [gridState, setGridState] = useState<State[][]>(() =>
    TIMES.map((_, timeIdx) =>
      DAYS.map(() => (INITIAL[timeIdx] === 1 ? "available" : "")),
    ),
  );
  const [deposit, setDeposit] = useState(20);

  const toggle = (rowIdx: number, colIdx: number) => {
    setGridState((prev) => {
      const copy = prev.map((row) => [...row]);
      const row = copy[rowIdx];
      if (!row) return prev;
      const current = row[colIdx];
      if (current === undefined) return prev;
      const nextIndex = (CYCLE.indexOf(current) + 1) % CYCLE.length;
      const nextVal = CYCLE[nextIndex];
      if (nextVal !== undefined) {
        row[colIdx] = nextVal;
      }
      return copy;
    });
  };

  return (
    <div>
      <div className="rounded-2xl border border-border-light bg-bg-secondary p-4 overflow-x-auto">
        <div className="grid grid-cols-[60px_repeat(5,1fr)] gap-1.5 min-w-[380px]">
          <div />
          {DAYS.map((d) => (
            <div
              key={d}
              className="py-1 text-center text-[12px] font-bold text-text-muted"
            >
              {d}
            </div>
          ))}

          {TIMES.map((time, rowIdx) => (
            <React.Fragment key={time}>
              <div className="self-center pr-2 text-right text-[12px] font-bold text-text-muted tabular-nums">
                {time}
              </div>
              {(gridState[rowIdx] || []).map((s, colIdx) => (
                <button
                  key={colIdx}
                  type="button"
                  onClick={() => toggle(rowIdx, colIdx)}
                  className={`flex h-9 items-center justify-center rounded-lg border text-[11.5px] font-semibold transition cursor-pointer select-none ${
                    s === "available"
                      ? "border-success-border bg-success-bg text-emerald-700 hover:bg-emerald-100/60"
                      : s === "blocked"
                        ? "border-danger-border bg-danger-bg text-red-700 hover:bg-red-100/60"
                        : "border-border-light bg-bg-primary hover:border-brand-blue hover:scale-[1.02] text-text-muted"
                  }`}
                >
                  {s === "available" && (
                    <span className="mr-0.5 text-[10px]">✓</span>
                  )}
                  {s === "blocked" && (
                    <span className="mr-0.5 text-[10px]">✕</span>
                  )}
                  {time.split(":")[0]}
                </button>
              ))}
            </React.Fragment>
          ))}
        </div>

        <div className="mt-3.5 flex flex-wrap gap-4 text-[12px] text-text-muted font-medium">
          <LegendItem
            color="bg-success-bg border-success-border text-emerald-700"
            label="Available"
          />
          <LegendItem color="bg-bg-primary border-border-light" label="Unset" />
          <LegendItem
            color="bg-danger-bg border-danger-border text-red-700"
            label="Blocked"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3 rounded-xl border border-border-light bg-bg-secondary px-4 py-3">
        <span className="flex-1 text-[13.5px] font-semibold text-text-primary">
          💳 Deposit required at checkout
        </span>
        <div className="flex items-center gap-1 bg-bg-primary border border-border-light rounded-lg px-2.5 py-1.5 focus-within:border-brand-blue transition">
          <input
            type="number"
            value={deposit}
            min={0}
            max={100}
            onChange={(e) =>
              setDeposit(Math.min(100, Math.max(0, Number(e.target.value))))
            }
            className="w-10 text-right font-bold text-brand-blue focus:outline-none text-[13.5px] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="font-bold text-brand-blue text-[13.5px]">%</span>
        </div>
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`h-3.5 w-3.5 rounded-md border ${color}`} />
      {label}
    </span>
  );
}
