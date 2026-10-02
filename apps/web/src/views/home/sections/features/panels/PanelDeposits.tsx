"use client";

import { motion } from "framer-motion";
import {
  DEPOSIT_TRANSACTIONS,
  DEPOSIT_DAILY_REVENUE,
} from "../constants/features.constants";

export function PanelDeposits() {
  return (
    <div className="flex flex-col gap-4 font-sans h-full">
      {/* Revenue Box */}
      <div className="relative rounded-2xl bg-gradient-to-br from-primary to-primary-hover p-4.5 text-primary-foreground overflow-hidden shadow-md flex-1 flex flex-col justify-between min-h-[175px]">
        {/* Background glow pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-surface/20 via-transparent to-transparent pointer-events-none" />

        <div className="shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-primary-foreground/80 leading-none">
            This Week&apos;s Revenue
          </p>
          <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight leading-none font-mono">
            $1,240
          </h3>
          <p className="mt-1.5 text-[10px] text-primary-foreground/95 flex items-center gap-1 font-semibold leading-none">
            <span className="text-[11px] font-bold">↑</span> +18% vs last week
          </p>
        </div>

        {/* Bar Chart */}
        <div className="mt-4.5">
          <div className="flex items-end justify-between h-[45px] gap-1.5 px-0.5">
            {DEPOSIT_DAILY_REVENUE.map((height, i) => (
              <div
                key={i}
                className="flex-1 flex flex-col items-center gap-1 group relative"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.08,
                    ease: "easeOut",
                  }}
                  className="w-full bg-surface/35 rounded-t-sm group-hover:bg-surface group-hover:shadow-md transition-all duration-200"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5 mt-1.5 text-[8.5px] font-bold text-primary-foreground/70 text-center select-none leading-none">
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
            <span>Sun</span>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="rounded-2xl bg-background/40 p-4 border border-border/40 shrink-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground mb-3 leading-none">
          Recent Transactions
        </p>
        <div className="space-y-2">
          {DEPOSIT_TRANSACTIONS.map((tx, idx) => {
            const isNegative = tx.type === "minus";

            return (
              <div
                key={idx}
                className="flex items-center justify-between bg-surface px-3 py-2 rounded-xl border border-border/40 shadow-md"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-[12px] leading-none shrink-0 ${
                      isNegative
                        ? "bg-danger-surface border border-danger-border text-danger-surface-foreground"
                        : "bg-success-surface border border-success-border text-success-surface-foreground"
                    }`}
                  >
                    {isNegative ? "−" : "+"}
                  </div>
                  <div>
                    <h6 className="font-extrabold text-foreground text-[11.5px] leading-tight">
                      {tx.title}
                    </h6>
                    <p className="text-[9px] text-muted-foreground mt-0.5 leading-none">
                      {tx.meta}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-extrabold leading-none ${
                    isNegative
                      ? "text-danger-surface-foreground"
                      : "text-success-surface-foreground"
                  }`}
                >
                  {tx.amount}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
