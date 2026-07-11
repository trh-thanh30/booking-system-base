"use client";

import { PanelServiceForm } from "./panels/PanelServiceForm";
import { PanelAvailability } from "./panels/PanelAvailability";
import { PanelShare } from "./panels/PanelShare";
import { PanelBookings } from "./panels/PanelBookings";
import type { StepId } from "./HowItWorksSection.types";

interface Props {
  activeStep: StepId;
}

const STEP_META: Record<StepId, { badge: string; title: string; sub: string }> =
  {
    "1": {
      badge: "Step 01",
      title: "Create your service",
      sub: "Fill in the details — preview updates live on the right.",
    },
    "2": {
      badge: "Step 02",
      title: "Set your availability",
      sub: "Click any slot to toggle: available (green) → blocked (red) → clear.",
    },
    "3": {
      badge: "Step 03",
      title: "Share your booking page",
      sub: "Customize your URL, copy it, or download a QR code.",
    },
    "4": {
      badge: "Step 04",
      title: "Manage your bookings",
      sub: "New bookings appear here in real time — fully synced with your calendar.",
    },
  };

export function DemoPanel({ activeStep }: Props) {
  const meta = STEP_META[activeStep];

  return (
    <div className="rounded-3xl border border-border-light bg-bg-primary p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] sm:p-7">
      {/* key={activeStep} forces React to re-mount the component, which triggers CSS animations to re-run on transition */}
      <div key={activeStep} className="animate-panel-in">
        <div className="mb-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-blue/10 px-2.5 py-1 text-[11px] font-bold text-brand-blue uppercase">
            {meta.badge}
          </span>
        </div>
        <h3 className="mb-2 text-[20px] sm:text-[22px] font-bold text-text-primary tracking-[-0.01em]">
          {meta.title}
        </h3>
        <p className="mb-5 text-[13px] sm:text-[13.5px] text-text-muted leading-relaxed">
          {meta.sub}
        </p>

        {activeStep === "1" && <PanelServiceForm />}
        {activeStep === "2" && <PanelAvailability />}
        {activeStep === "3" && <PanelShare />}
        {activeStep === "4" && <PanelBookings />}
      </div>
    </div>
  );
}
