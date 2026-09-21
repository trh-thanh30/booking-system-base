"use client";

import { STAFF_MEMBERS } from "../features.constants";

export function PanelStaff() {
  return (
    <div className="flex flex-col gap-3 font-sans h-full justify-center">
      {STAFF_MEMBERS.map((staff, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-border-light/40 bg-bg-secondary/40 p-4 flex flex-col gap-3.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center font-extrabold text-[11px]">
                {staff.initial}
              </div>
              <div>
                <h5 className="font-extrabold text-text-primary text-xs leading-none">
                  {staff.name}
                </h5>
                <p className="text-[9.5px] text-text-muted mt-1 leading-none">
                  {staff.role}{" "}
                  {staff.ptoMsg && (
                    <span className="text-amber-500 font-bold ml-1.5">
                      · {staff.ptoMsg}
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[9px] font-bold text-brand-blue leading-none">
              Active
            </span>
          </div>

          {/* Timeline shift bar */}
          <div>
            <div className="flex h-2.5 w-full bg-bg-primary rounded-full overflow-hidden border border-border-light/20">
              {staff.timeline.map((block, bIdx) => {
                let colorClass = "bg-brand-blue";
                if (block.type === "lunch") colorClass = "bg-zinc-200";
                if (block.type === "pto") colorClass = "bg-amber-500";

                return (
                  <div
                    key={bIdx}
                    style={{ flex: block.flex }}
                    className={`${colorClass} border-r border-white/40 last:border-r-0`}
                    title={block.type.toUpperCase()}
                  />
                );
              })}
            </div>
            <div className="flex items-center justify-between text-[9px] font-mono text-text-muted mt-2 font-bold leading-none">
              <span>{staff.shift.split(" — ")[0]}</span>
              <span>{staff.shift.split(" — ")[1]}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
