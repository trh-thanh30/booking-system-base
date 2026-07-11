"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRepeatReveal } from "@/src/hooks/useRepeatReveal";
import { StepList } from "./StepList";
import { DemoPanel } from "./DemoPanel";
import type { StepMeta, StepId } from "./HowItWorksSection.types";

export const STEPS: StepMeta[] = [
  {
    id: "1",
    number: "01",
    title: "Create services",
    desc: "Add service names, prices, durations and assign the right staff.",
    icon: "list",
  },
  {
    id: "2",
    number: "02",
    title: "Set availability & rules",
    desc: "Define working hours, booking rules, deposit policy and time slots.",
    icon: "calendar",
  },
  {
    id: "3",
    number: "03",
    title: "Share booking page",
    desc: "Publish your booking link on website, social bio, QR code or marketplace.",
    icon: "link",
  },
  {
    id: "4",
    number: "04",
    title: "Accept & manage bookings",
    desc: "Book online while appointments, payments and reminders sync to dashboard.",
    icon: "grid",
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState<StepId>("1");

  // Use the native repeat reveal hook for consistent entry animation
  const reveal = useRepeatReveal({ amount: 0.2 });

  return (
    <motion.section
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      transition={reveal.transition}
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-bg-primary border-t border-border-light font-sans overflow-hidden"
      id="how-it-works"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Header */}
        <div className="mb-12 text-center max-w-3xl mx-auto space-y-3.5">
          <div className="text-[12px] font-bold uppercase tracking-[0.08em] text-brand-blue">
            How it works
          </div>
          <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-extrabold leading-[1.15] tracking-[-0.02em] text-text-primary">
            Launch your booking flow in minutes
          </h2>
          <p className="text-[15.5px] leading-relaxed text-text-muted">
            Create services, set availability, share your booking page and let
            customers book online 24/7 — no code required.
          </p>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.85fr_1.15fr] items-start">
          <StepList
            steps={STEPS}
            activeStep={activeStep}
            onSelect={setActiveStep}
          />
          <div className="lg:sticky lg:top-24 w-full">
            <DemoPanel activeStep={activeStep} />
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="#features"
            className="group inline-flex min-h-11 items-center justify-center rounded-full border border-border-light bg-bg-primary px-7 text-sm font-semibold text-text-secondary transition hover:bg-brand-blue hover:text-white hover:border-brand-blue active:scale-[0.98] shadow-sm gap-0 hover:gap-1.5 cursor-pointer duration-200"
          >
            <span>Explore all features</span>
            <span className="relative flex h-4 w-0 items-center justify-center overflow-hidden transition-all duration-300 group-hover:w-4">
              <span className="absolute transition-all duration-300 transform -translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:animate-bounce">
                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </span>
          </a>
        </div>
      </div>
    </motion.section>
  );
}
