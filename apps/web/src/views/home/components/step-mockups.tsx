"use client";

import {
  ListChecks,
  CalendarClock,
  Link as LinkIcon,
  LayoutDashboard,
} from "lucide-react";

// Mini UI Mockups for How It Works Step Cards
export function ServiceSetupMockup() {
  return (
    <div className="mt-4 rounded-2xl border border-border-light bg-bg-secondary/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted leading-none">
        Service setup
      </p>
      <div className="mt-3 rounded-xl bg-bg-primary p-3 shadow-sm border border-border-light/60">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-text-primary">Haircut</p>
          <span className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-[10px] font-bold text-brand-blue leading-none">
            $25
          </span>
        </div>
        <p className="mt-1 text-[10px] text-text-muted">
          45 min · Staff: Anna, Mia
        </p>
        <div className="mt-2.5 flex -space-x-1.5">
          <div className="h-6 w-6 rounded-full border border-bg-primary bg-zinc-200 flex items-center justify-center text-[8px] font-extrabold text-zinc-600">
            A
          </div>
          <div className="h-6 w-6 rounded-full border border-bg-primary bg-zinc-300 flex items-center justify-center text-[8px] font-extrabold text-zinc-700">
            M
          </div>
        </div>
      </div>
    </div>
  );
}

export function AvailabilityMockup() {
  return (
    <div className="mt-4 rounded-2xl border border-border-light bg-bg-secondary/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted leading-none">
        Availability slots
      </p>
      <div className="mt-3 grid grid-cols-3 gap-1.5">
        {["09:00", "10:30", "14:00"].map((slot) => (
          <div
            key={slot}
            className="rounded-lg bg-bg-primary border border-border-light px-2 py-1 text-center text-[10px] font-bold text-text-secondary shadow-sm"
          >
            {slot}
          </div>
        ))}
      </div>
      <div className="mt-2.5 rounded-lg bg-bg-primary border border-border-light px-3 py-1.5 text-[9px] text-text-secondary shadow-sm flex items-center justify-between">
        <span>Deposit Required</span>
        <span className="font-bold text-brand-blue">20%</span>
      </div>
    </div>
  );
}

export function ShareLinkMockup() {
  return (
    <div className="mt-4 rounded-2xl border border-border-light bg-bg-secondary/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted leading-none">
        Booking page link
      </p>
      <div className="mt-3 rounded-xl bg-bg-primary p-3 shadow-sm border border-border-light/60">
        <p className="truncate text-[10px] font-bold text-brand-blue-hover">
          booking.link/glow-salon
        </p>
        <div className="mt-2.5 flex gap-1.5">
          <span className="rounded-md bg-bg-secondary border border-border-light/60 px-2 py-1 text-[8px] font-bold text-text-secondary cursor-default">
            Copy
          </span>
          <span className="rounded-md bg-bg-secondary border border-border-light/60 px-2 py-1 text-[8px] font-bold text-text-secondary cursor-default">
            QR Code
          </span>
        </div>
      </div>
    </div>
  );
}

export function BookingConfirmedMockup() {
  return (
    <div className="mt-4 rounded-2xl border border-border-light bg-bg-secondary/40 p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted leading-none">
        Real-time sync
      </p>
      <div className="mt-3 space-y-1.5">
        {[
          { label: "Booking confirmed", active: true },
          { label: "Deposit collected", active: true },
          { label: "Reminder scheduled", active: false },
        ].map((item, idx) => (
          <div
            key={idx}
            className="rounded-lg bg-bg-primary border border-border-light px-2.5 py-1.5 text-[9px] font-bold text-text-secondary shadow-sm flex items-center gap-2"
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-emerald-500" : "bg-brand-blue animate-pulse"}`}
            />
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StepMockup({ type }: { type: string }) {
  if (type === "services") return <ServiceSetupMockup />;
  if (type === "availability") return <AvailabilityMockup />;
  if (type === "share") return <ShareLinkMockup />;
  return <BookingConfirmedMockup />;
}

export const getStepIcon = (iconName: string) => {
  switch (iconName) {
    case "ListChecks":
      return ListChecks;
    case "CalendarClock":
      return CalendarClock;
    case "Link":
      return LinkIcon;
    case "LayoutDashboard":
      return LayoutDashboard;
    default:
      return ListChecks;
  }
};
