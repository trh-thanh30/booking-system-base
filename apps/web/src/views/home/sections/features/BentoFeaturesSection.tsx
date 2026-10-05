"use client";

import { useState } from "react";
import { ArrowRight, ChevronDown, Video, Link2 } from "lucide-react";
import {
  LandingSection,
  LandingContainer,
} from "@/src/components/common/landing-compositions";

import { SQUIRCLE_FEATURES } from "./constants/bento-features.constants";

export function BentoFeaturesSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <LandingSection
      id="features"
      className="scroll-mt-24 py-24 lg:py-32 bg-surface text-foreground font-sans overflow-hidden"
    >
      <LandingContainer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-24">
        {/* TIER 1: 4 COMPACT, SQUARE-PROPORTIONED BENEFIT CARDS (CAL.COM STYLE) */}
        <div className="space-y-12">
          {/* Section Header */}
          <div className="text-center max-w-5xl mx-auto space-y-4">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] text-balance">
              One platform for{" "}
              <span className="text-primary">every appointment</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              Keep availability, booking links, calendar sync, and reminders
              working together.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-primary text-primary-foreground text-sm sm:text-base font-bold hover:bg-primary-hover transition-colors shadow-xs"
              >
                <span>Get started</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 px-7 py-3 rounded-full bg-surface border border-input text-foreground text-sm sm:text-base font-bold hover:bg-muted transition-colors shadow-xs"
              >
                <span>Book a demo</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* 2x2 Compact Square-ish Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* CARD 1: Avoid Appointment Overload */}
            <div className="rounded-3xl border border-border bg-muted/70 p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xs hover:border-primary/40 transition-all min-h-[340px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Avoid meeting overload
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Set daily limits and add buffers around events to sanitize and
                  reset.
                </p>
              </div>

              {/* Compact Mockup: Notice & Buffers */}
              <div className="rounded-2xl border border-border bg-surface p-5 space-y-3.5 shadow-xs">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  Notice and buffers
                </p>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Minimum notice
                    </span>
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-muted text-foreground font-medium">
                      <span>24 hours</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Buffer before
                      </span>
                      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-muted text-foreground font-medium">
                        <span>15 mins</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Buffer after
                      </span>
                      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-muted text-foreground font-medium">
                        <span>15 mins</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Stand Out with a Custom Booking Link */}
            <div className="rounded-3xl border border-border bg-muted/70 p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xs hover:border-primary/40 transition-all min-h-[340px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Stand out with a custom booking link
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Short, clean link that clients easily remember without messy
                  URLs.
                </p>
              </div>

              {/* Compact Mockup: Link Bubble & Service Card */}
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="px-4 py-1 rounded-full border border-border bg-surface shadow-xs text-xs font-mono text-foreground font-semibold inline-flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-muted-foreground" />
                    <span>cal.com/bailey</span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-2.5 shadow-xs text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-muted text-foreground font-bold text-xs flex items-center justify-center">
                      BP
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Bailey Pumfleet
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        Business meeting
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-1.5 pt-1 text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground">
                      15m
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-primary text-primary-foreground font-semibold">
                      30m
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground">
                      45m
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-muted text-foreground">
                      1h
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground pt-1.5 border-t border-border">
                    <span className="inline-flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" /> Zoom
                    </span>
                    <span>North America/California</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Streamline Your Bookers' Experience */}
            <div className="rounded-3xl border border-border bg-muted/70 p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xs hover:border-primary/40 transition-all min-h-[340px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Streamline your bookers&apos; experience
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Let bookers overlay their calendar and reschedule with zero
                  friction.
                </p>
              </div>

              {/* Compact Mockup: Calendar Overlay */}
              <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-border text-xs">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <div className="w-6 h-3.5 rounded-full bg-primary relative p-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground ml-auto" />
                    </div>
                    <span>Overlay my calendar</span>
                  </div>
                  <span className="text-muted-foreground font-semibold">
                    12h / 24h
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      Wed 06
                    </span>
                    <div className="p-1.5 rounded-lg bg-muted text-foreground font-medium truncate text-[11px]">
                      Lunch date
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      Thu 07
                    </span>
                    <div className="p-1.5 rounded-lg bg-primary text-primary-foreground font-medium truncate text-[11px]">
                      Coffee 11am
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      Fri 08
                    </span>
                    <div className="p-1.5 rounded-lg border border-dashed border-input text-muted-foreground text-[11px]">
                      Open slot
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      Sat 09
                    </span>
                    <div className="p-1.5 rounded-lg bg-muted text-foreground font-medium truncate text-[11px]">
                      Hiring call
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Reduce No-Shows with Automated Meeting Reminders */}
            <div className="rounded-3xl border border-border bg-muted/70 p-8 sm:p-10 flex flex-col justify-between space-y-6 shadow-xs hover:border-primary/40 transition-all min-h-[340px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  Reduce no-shows with automated reminders
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  Instant confirmation and multi-step reminders before every
                  session.
                </p>
              </div>

              {/* Compact Mockup: Notification Toast */}
              <div className="py-3 flex items-center justify-center">
                <div className="w-full rounded-2xl border border-border bg-surface p-4 shadow-xs flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                    Cal
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate">
                        New booking confirmed
                      </p>
                      <span className="text-[11px] text-muted-foreground shrink-0">
                        Just now
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      James Oliver booked a 30min discovery call.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TIER 2: CONFIGURABLE FEATURES */}
        <div className="space-y-12 pt-4">
          <div className="text-center max-w-5xl mx-auto space-y-3">
            <h3 className="text-xl sm:text-3xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
              <span className="block">
                The <span className="text-primary">features you need.</span>
              </span>
              <span className="block">
                A dashboard that{" "}
                <span className="text-primary">stays focused.</span>
              </span>
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              Show or hide features to match how you work, keeping unused tools
              out of your way. Your plan and pricing stay the same.
            </p>
          </div>

          {/* 12 Squircle Cards Grid matching user screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
            {SQUIRCLE_FEATURES.map((card, idx) => {
              const Icon = card.icon;
              const isHovered = hoveredIdx === idx;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  className="relative rounded-3xl border border-border bg-surface h-[220px] sm:h-[240px] shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.98]"
                >
                  {/* STATE 1: DEFAULT STATE (MATCHING USER DEMO PHOTO 1) */}
                  <div
                    className={`absolute inset-0 p-6 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                      isHovered
                        ? "opacity-0 scale-95 pointer-events-none"
                        : "opacity-100 scale-100"
                    }`}
                  >
                    {/* Squircle Push-Button Badge with 4 Corner Rivets */}
                    <div className="w-20 h-20 rounded-2xl bg-muted/90 border border-border/90 flex items-center justify-center relative shadow-xs">
                      {/* 4 Corner Rivet Dots */}
                      <span className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-input" />
                      <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-input" />
                      <span className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-input" />
                      <span className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-input" />

                      <Icon className="w-8 h-8 text-primary" />
                    </div>

                    {/* Title */}
                    <h4 className="text-sm sm:text-base font-bold text-foreground tracking-tight mt-4 leading-snug px-1">
                      {card.title}
                    </h4>
                  </div>

                  {/* STATE 2: HOVER STATE (MATCHING USER DEMO PHOTO 2) */}
                  <div
                    className={`absolute inset-0 p-7 flex flex-col items-center justify-center text-center transition-all duration-300 ${
                      isHovered
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-95 pointer-events-none"
                    }`}
                  >
                    {/* 4 Corner Rivet Dots on the Card Itself! */}
                    <span className="absolute top-4 left-4 w-1.5 h-1.5 rounded-full bg-input" />
                    <span className="absolute top-4 right-4 w-1.5 h-1.5 rounded-full bg-input" />
                    <span className="absolute bottom-4 left-4 w-1.5 h-1.5 rounded-full bg-input" />
                    <span className="absolute bottom-4 right-4 w-1.5 h-1.5 rounded-full bg-input" />

                    {/* Title & Description */}
                    <h4 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                      {card.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2.5 max-w-[240px]">
                      {card.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
