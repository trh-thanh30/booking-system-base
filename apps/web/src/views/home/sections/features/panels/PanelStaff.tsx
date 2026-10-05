"use client";

import { STAFF_MEMBERS } from "../constants/features.constants";

export function PanelStaff() {
  return (
    <div className="flex flex-col gap-3 font-sans h-full justify-center">
      {STAFF_MEMBERS.map((staff, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border/40 bg-background/40 p-4 flex flex-col gap-3.5 shadow-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-extrabold text-[11px]">
                {staff.initial}
              </div>
              <div>
                <h5 className="font-extrabold text-foreground text-xs leading-none">
                  {staff.name}
                </h5>
                <p className="text-[9.5px] text-muted-foreground mt-1 leading-none">
                  {staff.role}{" "}
                  {staff.ptoMsg && (
                    <span className="text-warning-500 font-bold ml-1.5">
                      · {staff.ptoMsg}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary leading-none">
              Active
            </span>
          </div>

          {/* Timeline shift bar */}
          <div>
            <div className="flex h-2.5 w-full bg-surface rounded-full overflow-hidden border border-border/20">
              {staff.timeline.map((block, bIdx) => {
                let colorClass = "bg-primary";
                if (block.type === "lunch") colorClass = "bg-neutral-200";
                if (block.type === "pto") colorClass = "bg-warning-500";

                return (
                  <div
                    key={bIdx}
                    style={{ flex: block.flex }}
                    className={`${colorClass} border-r border-surface/40 last:border-r-0`}
                    title={block.type.toUpperCase()}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground mt-2 font-bold leading-none">
              <span>{staff.shift.split(" — ")[0]}</span>
              <span>{staff.shift.split(" — ")[1]}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
