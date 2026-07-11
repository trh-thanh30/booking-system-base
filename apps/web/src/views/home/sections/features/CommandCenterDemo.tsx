"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { FeatureTab } from "./features.types";
import { PanelBookings } from "./panels/PanelBookings";
import { PanelBrandedPage } from "./panels/PanelBrandedPage";
import { PanelAvailability } from "./panels/PanelAvailability";
import { PanelStaff } from "./panels/PanelStaff";
import { PanelDeposits } from "./panels/PanelDeposits";
import { PanelReminders } from "./panels/PanelReminders";
import { PanelReports } from "./panels/PanelReports";

const METADATA = {
  bookings: {
    eyebrow: "Booking Command Center",
    title: "Live booking operations",
    sync: "Real-time sync",
    syncStatus: "success",
  },
  page: {
    eyebrow: "Booking Command Center",
    title: "Branded booking page",
    sync: "Live preview",
    syncStatus: "info",
  },
  availability: {
    eyebrow: "Booking Command Center",
    title: "Smart availability",
    sync: "Auto-updating",
    syncStatus: "success",
  },
  staff: {
    eyebrow: "Booking Command Center",
    title: "Staff scheduling",
    sync: "Shift synced",
    syncStatus: "info",
  },
  deposits: {
    eyebrow: "Booking Command Center",
    title: "Deposits & payments",
    sync: "Stripe live",
    syncStatus: "success",
  },
  reminders: {
    eyebrow: "Booking Command Center",
    title: "Automated reminders",
    sync: "Queue active",
    syncStatus: "success",
  },
  reports: {
    eyebrow: "Booking Command Center",
    title: "Reports & insights",
    sync: "Updated hourly",
    syncStatus: "info",
  },
};

interface Props {
  activeTab: FeatureTab;
}

export function CommandCenterDemo({ activeTab }: Props) {
  const meta = METADATA[activeTab] || METADATA.bookings;
  const isSuccessBadge = meta.syncStatus === "success";

  return (
    <div className="rounded-[2.5rem] border border-border-light bg-bg-primary p-6 md:p-7.5 shadow-[0_20px_50px_rgba(229,240,255,0.7),0_1px_3px_rgba(0,0,0,0.05)] ring-1 ring-zinc-100/50 font-sans w-full h-auto lg:h-[560px] min-h-[480px] lg:min-h-[560px] flex flex-col justify-between relative overflow-hidden">
      {/* Dashboard Top Header */}
      <div className="flex items-start justify-between gap-4 border-b border-border-light/40 pb-4.5 shrink-0 select-none">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-brand-blue leading-none">
            {meta.eyebrow}
          </p>
          <h3 className="mt-2 text-base sm:text-lg font-extrabold tracking-tight text-text-primary leading-tight">
            {meta.title}
          </h3>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[9px] font-bold border transition-colors duration-300 ${
            isSuccessBadge
              ? "bg-emerald-50 border-emerald-200 text-emerald-700"
              : "bg-blue-50 border-blue-200 text-blue-700"
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
              isSuccessBadge ? "bg-emerald-500" : "bg-blue-500"
            }`}
          />
          <span>{meta.sync}</span>
        </span>
      </div>

      {/* Dynamic Content Panel area */}
      <div className="flex-1 mt-5 min-h-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="w-full h-full"
          >
            {activeTab === "bookings" && (
              <PanelBookings isActive={activeTab === "bookings"} />
            )}
            {activeTab === "page" && <PanelBrandedPage />}
            {activeTab === "availability" && <PanelAvailability />}
            {activeTab === "staff" && <PanelStaff />}
            {activeTab === "deposits" && <PanelDeposits />}
            {activeTab === "reminders" && <PanelReminders />}
            {activeTab === "reports" && <PanelReports />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dashboard Footer Banner */}
      <div className="mt-6.5 -mx-6 md:-mx-7.5 -mb-6 md:-mb-7.5 rounded-b-[2.5rem] bg-[#E5F0FF]/30 py-3.5 px-6 md:px-7.5 border-t border-[#E5F0FF]/50 flex items-center justify-center gap-2 select-none shrink-0">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
        <p className="text-[10px] font-bold text-brand-blue leading-none">
          {activeTab === "bookings" &&
            "Auto-syncs as customers book, pay & reschedule"}
          {activeTab === "page" &&
            "Instantly reflects branding changes across booking links"}
          {activeTab === "availability" &&
            "Guards calendars from overlapping slots automatically"}
          {activeTab === "staff" &&
            "Locks and unlocks shift times on customer scheduling pages"}
          {activeTab === "deposits" &&
            "Pipes secure transaction credits via Stripe integrations"}
          {activeTab === "reminders" &&
            "Triggers background SMS/Email schedules to stop no-shows"}
          {activeTab === "reports" &&
            "Compiles productivity percentages and revenue graphs hourly"}
        </p>
      </div>
    </div>
  );
}
