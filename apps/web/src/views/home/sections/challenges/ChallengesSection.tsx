"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useRepeatReveal } from "@/src/hooks/useRepeatReveal";
import { ChallengeCards } from "./ChallengeCards";
import { ComparisonTable } from "./ComparisonTable";
import { TourControl } from "./TourControl";
import { CHALLENGES, COMPARISONS } from "./Challenges.data";
import type { ChallengeId } from "./Challenges.types";

export function ChallengesSection() {
  const [activeId, setActiveId] = useState<ChallengeId | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const reveal = useRepeatReveal({ amount: 0.2 });

  // Auto-play when entering viewport (with delay)
  useEffect(() => {
    if (reveal.isInView) {
      const timer = setTimeout(() => {
        if (!hasInteracted) {
          setIsPlaying(true);
        }
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setIsPlaying(false);
      setActiveId(null);
    }
  }, [reveal.isInView, hasInteracted]);

  // Autoplay intervals
  useEffect(() => {
    if (!isPlaying) return;

    if (!activeId) {
      setActiveId("1");
    }

    const interval = setInterval(() => {
      setActiveId((prev) => {
        const next = prev ? (Number(prev) % 4) + 1 : 1;
        return String(next) as ChallengeId;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [isPlaying, activeId]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "Escape") {
        setActiveId(null);
        setIsPlaying(false);
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsPlaying(false);
        setHasInteracted(true);
        setActiveId((prev) => {
          const next = prev ? (Number(prev) % 4) + 1 : 1;
          return String(next) as ChallengeId;
        });
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setIsPlaying(false);
        setHasInteracted(true);
        setActiveId((prev) => {
          const prevNum = prev ? ((Number(prev) - 2 + 4) % 4) + 1 : 4;
          return String(prevNum) as ChallengeId;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSelect = (id: ChallengeId) => {
    setIsPlaying(false);
    setHasInteracted(true);
    if (activeId === id) {
      setActiveId(null);
    } else {
      setActiveId(id);
    }
  };

  const handleTourToggle = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setHasInteracted(false); // Let it auto-rotate again
      setIsPlaying(true);
    }
  };

  return (
    <motion.section
      ref={reveal.ref}
      initial={reveal.initial}
      animate={reveal.animate}
      transition={reveal.transition}
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 border-t border-border-light bg-bg-secondary font-sans overflow-hidden"
      id="problems"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Header */}
        <div className="mb-10 text-center max-w-3xl mx-auto space-y-3.5">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-brand-blue">
            Merchant challenges
          </span>
          <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-extrabold leading-[1.15] tracking-[-0.02em] text-text-primary">
            Still managing bookings through chats, calls and paper notes?
          </h2>
          <p className="text-[15.5px] leading-relaxed text-text-muted">
            Manual scheduling creates double-booked slots, missed appointments
            and hours of back-and-forth messages before every booking is
            confirmed.
          </p>
        </div>

        {/* Tour Control */}
        <TourControl isPlaying={isPlaying} onToggle={handleTourToggle} />

        {/* Side-by-side 2-column layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[0.7fr_1.3fr] items-start mb-12">
          <ChallengeCards
            challenges={CHALLENGES}
            activeId={activeId}
            onSelect={handleSelect}
          />
          <div className="lg:sticky lg:top-24 w-full">
            <ComparisonTable
              comparisons={COMPARISONS}
              activeId={activeId}
              onSelect={handleSelect}
            />
          </div>
        </div>

        {/* Bottom CTA bar */}
        <div className="mx-auto w-full md:w-fit max-w-full rounded-3xl border border-border-light bg-bg-primary px-6 py-5 text-center shadow-sm flex flex-col md:flex-row items-center justify-between gap-5">
          <p className="text-[14px] font-semibold text-text-secondary leading-relaxed flex-1 text-left md:mr-8">
            A booking system turns scattered chats into one clear flow for
            services, staff, payments and reminders.
          </p>
          <a
            href="#how-it-works"
            className="group inline-flex min-h-11 items-center justify-center rounded-full border border-border-light bg-bg-primary px-6 text-sm font-semibold text-text-secondary transition hover:bg-brand-blue hover:text-white hover:border-brand-blue active:scale-[0.98] shadow-sm gap-0 hover:gap-1.5 whitespace-nowrap cursor-pointer duration-200"
          >
            <span>See how it works</span>
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
