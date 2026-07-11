"use client";

import { motion } from "framer-motion";
import { REPORT_KPIS, REPORT_SERVICES } from "../features.constants";

export function PanelReports() {
  return (
    <div className="flex flex-col gap-4 font-sans h-full">
      {/* KPI grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {REPORT_KPIS.map((kpi, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border-light/40 bg-bg-secondary/40 p-3 hover:border-brand-blue/20 hover:-translate-y-0.5 transition duration-200"
          >
            <span className="block text-[8.5px] font-bold uppercase tracking-wider text-text-muted leading-none">
              {kpi.label}
            </span>
            <div className="flex items-baseline justify-between mt-2.5">
              <span className="text-base sm:text-lg font-extrabold text-text-primary tracking-tight leading-none font-mono">
                {kpi.val}
              </span>
              <span
                className={`text-[9.5px] font-bold leading-none ${
                  kpi.trendType === "up" ? "text-emerald-600" : "text-rose-500"
                }`}
              >
                {kpi.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Top Services */}
      <div className="rounded-2xl bg-bg-secondary/40 p-4 border border-border-light/40 flex-1 flex flex-col min-h-0">
        <p className="text-[10px] font-extrabold uppercase tracking-wider text-text-muted mb-3.5 leading-none shrink-0">
          Top Services This Week
        </p>

        <div className="space-y-3 overflow-y-auto pr-0.5 max-h-[195px] scrollbar-thin">
          {REPORT_SERVICES.map((svc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 bg-bg-primary px-3.5 py-2.5 rounded-xl border border-border-light/30 shadow-[0_1px_2px_rgba(0,0,0,0.01)]"
            >
              <div className="flex-1 min-w-0">
                <span className="font-extrabold text-text-primary text-[11.5px] leading-tight block">
                  {svc.name}
                </span>
                {/* Horizontal Progress Bar */}
                <div className="h-1 w-full bg-[#E5F0FF]/40 rounded-full mt-2 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${svc.percent}%` }}
                    transition={{
                      duration: 0.8,
                      delay: idx * 0.1,
                      ease: "easeOut",
                    }}
                    className="h-full bg-brand-blue rounded-full"
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-xs font-extrabold text-text-primary font-mono block">
                  {svc.count}
                </span>
                <span className="text-[8px] font-bold text-text-muted mt-0.5 block leading-none">
                  bookings
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
