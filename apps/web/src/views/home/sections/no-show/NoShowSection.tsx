"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ArrowDown } from "lucide-react";
import { motion } from "framer-motion";
import { useRepeatReveal } from "@/src/hooks/useRepeatReveal";
import { Timeline } from "./Timeline";
import { ModeToggle } from "./ModeToggle";
import { OutcomeCard } from "./OutcomeCard";
import { ReplayButton } from "./ReplayButton";
import {
  STEPS_WITH,
  STEPS_WITHOUT,
  OUTCOME_WITH,
  OUTCOME_WITHOUT,
} from "./NoShowSection.data";
import type { Mode } from "./NoShowSection.types";

const STEP_DURATION_MS = 1300;

export function NoShowSection() {
  const [mode, setMode] = useState<Mode>("with");
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showOutcome, setShowOutcome] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const steps = mode === "with" ? STEPS_WITH : STEPS_WITHOUT;
  const outcome = mode === "with" ? OUTCOME_WITH : OUTCOME_WITHOUT;

  // Use the native repeat reveal hook for consistent entry animation
  const reveal = useRepeatReveal({ amount: 0.25 });

  // Auto-play when the section enters the viewport, and reset when it leaves
  useEffect(() => {
    if (reveal.isInView) {
      startSequence();
    } else {
      resetState();
      setIsPlaying(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reveal.isInView]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const resetState = () => {
    setActiveStep(0);
    setShowOutcome(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const startSequence = () => {
    resetState();
    setIsPlaying(true);
    let step = 0;
    const tick = () => {
      step++;
      if (step > 4) {
        setShowOutcome(true);
        setIsPlaying(false);
        return;
      }
      setActiveStep(step);
      timeoutRef.current = setTimeout(tick, STEP_DURATION_MS);
    };
    timeoutRef.current = setTimeout(tick, STEP_DURATION_MS);
  };

  const handleModeChange = (newMode: Mode) => {
    if (newMode === mode) return;
    setMode(newMode);
    resetState();
    timeoutRef.current = setTimeout(startSequence, 200);
  };

  const handleReplay = () => {
    if (isPlaying) {
      resetState();
      setIsPlaying(false);
    } else {
      startSequence();
    }
  };

  return (
    <motion.section
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      transition={reveal.transition}
      className="py-16 lg:py-24 bg-bg-primary border-t border-border-light scroll-mt-20 md:scroll-mt-24 overflow-hidden"
      id="deposits-reminders"
    >
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 sm:px-6 lg:grid-cols-[1fr_1.2fr] lg:gap-15 items-center">
        <div className="max-w-[480px]">
          <div className="mb-6 text-[12px] font-bold uppercase tracking-[0.08em] text-brand-blue animate-fade-in">
            No-show protection
          </div>

          <h2 className="mb-5 text-[28px] font-bold leading-[1.15] tracking-[-0.02em] sm:text-[34px] lg:text-[38px] text-text-primary">
            Reduce no-shows with deposits and reminders
          </h2>

          <p className="mb-7 text-[15px] leading-[1.6] text-text-muted">
            Collect deposits at checkout, verify customer contact details and
            send reminders before each appointment so your team spends less time
            chasing confirmations.
          </p>

          <ul className="mb-8 space-y-3">
            {[
              { strong: "Verified contacts", rest: "before booking" },
              {
                strong: "Flexible rules",
                rest: "for deposits and cancellations",
              },
              { strong: "SMS & email reminders", rest: "before appointments" },
            ].map((b, i) => (
              <li key={i} className="flex items-start gap-2.5 text-[14.5px]">
                <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-success-bg text-emerald-600 border border-success-border">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                <span>
                  <strong className="font-semibold text-text-primary">
                    {b.strong}
                  </strong>{" "}
                  <span className="text-text-muted">{b.rest}</span>
                </span>
              </li>
            ))}
          </ul>

          <a
            href="#templates"
            className="group inline-flex min-h-11 items-center justify-center rounded-full border border-border-light bg-bg-primary px-7 text-sm font-semibold text-text-secondary transition hover:bg-brand-blue hover:text-white hover:border-brand-blue active:scale-[0.98] shadow-sm gap-0 hover:gap-1.5 cursor-pointer duration-200"
          >
            <span>See ready-made templates</span>
            <span className="relative flex h-4 w-0 items-center justify-center overflow-hidden transition-all duration-300 group-hover:w-4">
              <span className="absolute transition-all duration-300 transform -translate-y-5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 group-hover:animate-bounce">
                <ArrowDown className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </span>
          </a>
        </div>

        <div>
          <div className="rounded-[20px] border border-border-light bg-bg-primary p-6 shadow-[0_4px_24px_rgba(0,0,0,0.04)] sm:p-7 max-w-[520px] lg:ml-auto mx-auto w-full">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.08em] text-brand-blue">
                  No-show workflow
                </div>
                <div className="text-[19px] font-bold tracking-[-0.01em] text-text-primary">
                  See what happens to a booking
                </div>
              </div>
              <ModeToggle mode={mode} onChange={handleModeChange} />
            </div>

            <Timeline steps={steps} activeStep={activeStep} mode={mode} />
            <OutcomeCard outcome={outcome} visible={showOutcome} />

            <div className="mt-5 flex justify-center">
              <ReplayButton isPlaying={isPlaying} onClick={handleReplay} />
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
