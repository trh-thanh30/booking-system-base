"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Play, Square, ArrowDown } from "lucide-react";
import { useRepeatReveal } from "@/src/hooks/useRepeatReveal";
import { FEATURE_ITEMS } from "./features.constants";
import { FeatureList } from "./FeatureList";
import { CommandCenterDemo } from "./CommandCenterDemo";
import type { FeatureTab } from "./features.types";

export function FeaturesSection() {
  const [activeTab, setActiveTab] = useState<FeatureTab>("bookings");
  const [isTourPlaying, setIsTourPlaying] = useState<boolean>(true);

  const reveal = useRepeatReveal({ amount: 0.15 });
  const tourIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Disable auto-play tour on mobile devices on mount
  useEffect(() => {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setIsTourPlaying(false);
    }
  }, []);

  // Auto-play tour loop
  useEffect(() => {
    if (!isTourPlaying) {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
      return;
    }

    tourIntervalRef.current = setInterval(() => {
      setActiveTab((current) => {
        const currentIndex = FEATURE_ITEMS.findIndex(
          (item) => item.id === current,
        );
        const nextIndex = (currentIndex + 1) % FEATURE_ITEMS.length;
        return FEATURE_ITEMS[nextIndex]?.id || current;
      });
    }, 3200);

    return () => {
      if (tourIntervalRef.current) clearInterval(tourIntervalRef.current);
    };
  }, [isTourPlaying]);

  const handleSelectTab = (tab: FeatureTab) => {
    setIsTourPlaying(false); // Stop tour on manual click
    setActiveTab(tab);
  };

  const handleToggleTour = () => {
    setIsTourPlaying((prev) => !prev);
  };

  return (
    <motion.section
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      transition={reveal.transition}
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-bg-secondary border-t border-border-light font-sans overflow-hidden"
      id="features"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-3.5">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-brand-blue">
            All-in-One Solution
          </span>
          <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-extrabold leading-[1.15] tracking-[-0.02em] text-text-primary">
            Run your entire booking operation from one place
          </h2>
          <p className="text-[15.5px] leading-relaxed text-text-muted">
            Create a branded booking page, manage availability, collect
            deposits, send reminders and track performance from one dashboard.
          </p>
        </div>

        {/* Tour Control Bar */}
        <div className="flex justify-center items-center gap-4 mb-10 flex-wrap text-center select-none">
          <span className="text-[12.5px] font-semibold text-text-muted">
            Click any feature — the dashboard transforms to match
          </span>
          <button
            type="button"
            onClick={handleToggleTour}
            className={`group inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[11.5px] font-bold transition duration-200 cursor-pointer shadow-sm ${
              isTourPlaying
                ? "bg-brand-blue border-brand-blue text-white hover:bg-brand-blue/90"
                : "bg-bg-primary border-border-light text-text-secondary hover:border-brand-blue hover:text-brand-blue"
            }`}
          >
            {isTourPlaying ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                <Square className="w-2.5 h-2.5 fill-white stroke-white" />
                <span>Stop tour</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
                <Play className="w-2.5 h-2.5 fill-brand-blue stroke-brand-blue group-hover:fill-brand-blue group-hover:stroke-brand-blue" />
                <span>Start tour</span>
              </>
            )}
          </button>
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.88fr_1.12fr] items-start">
          {/* Left Column: Interactive Feature List */}
          <FeatureList
            features={FEATURE_ITEMS}
            activeTab={activeTab}
            onSelect={handleSelectTab}
          />

          {/* Right Column: Dynamic Interactive Mockup/Dashboard Demo (Sticky on desktop) */}
          <div className="lg:sticky lg:top-24 w-full">
            <CommandCenterDemo activeTab={activeTab} />
          </div>
        </div>

        {/* Bottom Secondary CTA */}
        <div className="mt-14 text-center">
          <a
            href="#deposits-reminders"
            className="group inline-flex min-h-11 items-center justify-center rounded-full border border-border-light bg-bg-primary px-7 text-sm font-semibold text-text-secondary transition hover:bg-brand-blue hover:text-white hover:border-brand-blue active:scale-[0.98] shadow-sm gap-0 hover:gap-1.5 cursor-pointer duration-200"
          >
            <span>See no-show protection</span>
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
