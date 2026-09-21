"use client";

import { motion } from "framer-motion";
import {
  DEPOSIT_TRANSACTIONS,
  DEPOSIT_DAILY_REVENUE,
} from "../features.constants";

export function PanelDeposits() {
  return (
    <div className="flex flex-col gap-4 font-sans h-full">
      {/* Revenue Box */}
      <div className="relative rounded-2xl bg-gradient-to-br from-brand-blue to-[#4f46e5] p-4.5 text-white overflow-hidden shadow-md flex-1 flex flex-col justify-between min-h-[175px]">
        {/* Background glow pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />

        <div className="shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-wider text-white/80 leading-none">
            This Week&apos;s Revenue
          </p>
          <h3 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight leading-none font-mono">
            $1,240
          </h3>
          <p className="mt-1.5 text-[10px] text-white/95 flex items-center gap-1 font-semibold leading-none">
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
                  className="w-full bg-white/35 rounded-t-sm group-hover:bg-white group-hover:shadow-[0_0_8px_rgba(255,255,255,0.4)] transition-all duration-200"
                />
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5 mt-1.5 text-[8.5px] font-bold text-white/70 text-center select-none leading-none">
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
      <div className="rounded-2xl bg-bg-secondary/40 p-4 border border-border-light/40 shrink-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-3 leading-none">
          Recent Transactions
        </p>
        <div className="space-y-2">
          {DEPOSIT_TRANSACTIONS.map((tx, idx) => {
            const isNegative = tx.type === "minus";

            return (
              <div
                key={idx}
                className="flex items-center justify-between bg-bg-primary px-3 py-2 rounded-xl border border-border-light/40 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-extrabold text-[12px] leading-none shrink-0 ${
                      isNegative
                        ? "bg-rose-50 border border-rose-100 text-rose-600"
                        : "bg-emerald-50 border border-emerald-100 text-emerald-600"
                    }`}
                  >
                    {isNegative ? "−" : "+"}
                  </div>
                  <div>
                    <h6 className="font-extrabold text-text-primary text-[11.5px] leading-tight">
                      {tx.title}
                    </h6>
                    <p className="text-[9px] text-text-muted mt-0.5 leading-none">
                      {tx.meta}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-xs font-extrabold leading-none ${
                    isNegative ? "text-rose-600" : "text-emerald-600"
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
