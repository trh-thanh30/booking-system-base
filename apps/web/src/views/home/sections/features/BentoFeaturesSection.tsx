"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, Video, Link2 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@repo/ui";
import { useTranslations } from "next-intl";
import {
  LandingSection,
  LandingContainer,
} from "@/src/components/common/landing-compositions";

import {
  FEATURE_GROUPS,
  FEATURE_PREVIEW_LIMIT,
  FEATURE_MOBILE_PREVIEW_LIMIT,
  SQUIRCLE_FEATURES,
} from "./constants/bento-features.constants";

export function BentoFeaturesSection() {
  const t = useTranslations("landing_page_home.features");
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [activeGroup, setActiveGroup] = useState<string>(FEATURE_GROUPS[0].id);
  const shouldReduceMotion = useReducedMotion();
  const activeGroupIndex = FEATURE_GROUPS.findIndex(
    (group) => group.id === activeGroup,
  );

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
              {t.rich("title", {
                highlight: (chunks) => (
                  <span className="text-primary">{chunks}</span>
                ),
              })}
            </h2>

            <p className="mt-5 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
              {t("description")}
            </p>

            <div className="flex items-center justify-center gap-2 pt-2 sm:gap-3.5">
              <a
                href="#pricing"
                className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-3 rounded-full bg-primary text-primary-foreground text-sm sm:text-base font-bold hover:bg-primary-hover transition-colors shadow-xs sm:px-7"
              >
                <span>{t("getStarted")}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex shrink-0 items-center justify-center gap-2 px-4 py-3 rounded-full bg-surface border border-input text-foreground text-sm sm:text-base font-bold hover:bg-muted transition-colors shadow-xs sm:px-7"
              >
                <span>{t("bookDemo")}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </a>
            </div>
          </div>

          {/* 2x2 Compact Square-ish Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            {/* CARD 1: Avoid Appointment Overload */}
            <div className="@container rounded-3xl border border-border bg-muted/70 p-5 sm:p-6 lg:p-10 flex flex-col justify-between space-y-6 shadow-xs hover:border-primary/40 transition-all min-h-[340px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {t("benefits.overload.title")}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("benefits.overload.description")}
                </p>
              </div>

              {/* Compact Mockup: Notice & Buffers */}
              <div className="rounded-2xl border border-border bg-surface p-5 space-y-3.5 shadow-xs">
                <p className="text-xs sm:text-sm font-bold text-foreground">
                  {t("benefits.overload.panelTitle")}
                </p>
                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-muted-foreground">
                      {t("benefits.overload.minimumNotice")}
                    </span>
                    <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-muted text-foreground font-medium">
                      <span>{t("benefits.overload.hours")}</span>
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 @min-[260px]:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("benefits.overload.before")}
                      </span>
                      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-muted text-foreground font-medium">
                        <span>{t("benefits.overload.minutes")}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-muted-foreground">
                        {t("benefits.overload.after")}
                      </span>
                      <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-border bg-muted text-foreground font-medium">
                        <span>{t("benefits.overload.minutes")}</span>
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 2: Stand Out with a Custom Booking Link */}
            <div className="@container rounded-3xl border border-border bg-muted/70 p-5 sm:p-6 lg:p-10 flex flex-col justify-between space-y-6 shadow-xs hover:border-primary/40 transition-all min-h-[340px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {t("benefits.link.title")}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("benefits.link.description")}
                </p>
              </div>

              {/* Compact Mockup: Link Bubble & Service Card */}
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="max-w-full px-3 py-2.5 rounded-2xl border border-border bg-surface shadow-xs text-xs font-mono text-foreground font-semibold inline-flex items-center gap-2">
                    <Link2 className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 break-all">
                      bookingbase.com/{t("benefits.link.slug")}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-2.5 shadow-xs text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-muted text-foreground font-bold text-xs flex items-center justify-center">
                      BP
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {t("benefits.link.author")}
                      </p>
                      <p className="text-sm font-bold text-foreground">
                        {t("benefits.link.meeting")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1 text-xs">
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

                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1.5 text-xs text-muted-foreground pt-1.5 border-t border-border">
                    <span className="inline-flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" /> Zoom
                    </span>
                    <span>{t("benefits.link.timezone")}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 3: Streamline Your Bookers' Experience */}
            <div className="rounded-3xl border border-border bg-muted/70 p-5 sm:p-6 lg:p-10 flex flex-col justify-between space-y-6 shadow-xs hover:border-primary/40 transition-all min-h-[340px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {t("benefits.experience.title")}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("benefits.experience.description")}
                </p>
              </div>

              {/* Compact Mockup: Calendar Overlay */}
              <div className="@container rounded-2xl border border-border bg-surface p-4 sm:p-5 space-y-3 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 pb-2 border-b border-border text-xs">
                  <div className="flex items-center gap-2 font-semibold text-foreground">
                    <div className="w-6 h-3.5 shrink-0 rounded-full bg-primary relative p-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground ml-auto" />
                    </div>
                    <span>{t("benefits.experience.overlay")}</span>
                  </div>
                  <span className="whitespace-nowrap text-muted-foreground font-semibold">
                    12h / 24h
                  </span>
                </div>

                <div className="grid grid-cols-2 @min-[300px]:grid-cols-4 gap-2 text-center text-xs [&>div]:min-w-0 [&>div]:flex [&>div]:flex-col [&>div>div]:flex-1 [&>div>div]:flex [&>div>div]:items-center [&>div>div]:justify-center">
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      {t("benefits.experience.wed")}
                    </span>
                    <div className="p-2 rounded-lg bg-muted text-foreground font-medium leading-snug text-xs">
                      {t("benefits.experience.lunch")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      {t("benefits.experience.thu")}
                    </span>
                    <div className="p-2 rounded-lg bg-primary text-primary-foreground font-medium leading-snug text-xs">
                      {t("benefits.experience.coffee")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      {t("benefits.experience.fri")}
                    </span>
                    <div className="p-2 rounded-lg border border-dashed border-input text-muted-foreground leading-snug text-xs">
                      {t("benefits.experience.open")}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="font-semibold text-muted-foreground">
                      {t("benefits.experience.sat")}
                    </span>
                    <div className="p-2 rounded-lg bg-muted text-foreground font-medium leading-snug text-xs">
                      {t("benefits.experience.hiring")}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD 4: Reduce No-Shows with Automated Meeting Reminders */}
            <div className="rounded-3xl border border-border bg-muted/70 p-5 sm:p-6 lg:p-10 flex flex-col justify-between space-y-6 shadow-xs hover:border-primary/40 transition-all min-h-[340px]">
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                  {t("benefits.reminders.title")}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  {t("benefits.reminders.description")}
                </p>
              </div>

              {/* Compact Mockup: Notification Toast */}
              <div className="py-3 flex items-center justify-center">
                <div className="w-full rounded-2xl border border-border bg-surface p-4 shadow-xs flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs shrink-0">
                    B
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
                      <p className="text-xs sm:text-sm font-bold text-foreground leading-snug">
                        {t("benefits.reminders.confirmed")}
                      </p>
                      <span className="text-[11px] text-muted-foreground shrink-0 whitespace-nowrap">
                        {t("benefits.reminders.now")}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {t("benefits.reminders.notification")}
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
            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight text-balance">
              {t.rich("configurable.title", {
                line: (chunks) => <span className="block">{chunks}</span>,
                highlight: (chunks) => (
                  <span className="text-primary">{chunks}</span>
                ),
              })}
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto">
              {t("configurable.description")}
            </p>
          </div>

          <Tabs
            value={activeGroup}
            onValueChange={(value) => {
              setHoveredIdx(null);
              setActiveGroup(value);
            }}
            className="space-y-8"
          >
            <div className="text-center">
              <TabsList
                aria-label={t("configurable.categoriesLabel")}
                className="grid h-auto w-full grid-cols-3 gap-1 rounded-none bg-transparent p-0 sm:inline-flex sm:w-auto sm:gap-4"
              >
                {FEATURE_GROUPS.map((group) => (
                  <TabsTrigger
                    key={group.id}
                    value={group.id}
                    className="h-auto min-h-12 whitespace-normal rounded-none border-b-2 border-transparent px-2 py-3 text-sm text-muted-foreground hover:text-primary data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none sm:whitespace-nowrap sm:px-4 sm:text-base"
                  >
                    <span>
                      <span className="block sm:inline">
                        {t(`groups.${group.id}.line1`)}
                      </span>{" "}
                      <span className="block sm:inline">
                        {t(`groups.${group.id}.line2`)}
                      </span>
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            <div className="relative h-[460px] sm:h-[504px]">
              {FEATURE_GROUPS.map((group, groupIndex) => {
                const isActive = group.id === activeGroup;
                return (
                  <TabsContent
                    key={group.id}
                    value={group.id}
                    forceMount
                    asChild
                    className="absolute inset-0 mt-0"
                  >
                    <motion.div
                      initial={false}
                      animate={{
                        opacity: isActive ? 1 : 0,
                        x:
                          shouldReduceMotion || isActive
                            ? 0
                            : groupIndex > activeGroupIndex
                              ? 8
                              : -8,
                      }}
                      transition={{
                        duration: shouldReduceMotion ? 0 : 0.25,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      aria-hidden={!isActive}
                      inert={!isActive}
                      style={{ pointerEvents: isActive ? "auto" : "none" }}
                    >
                      <div className="grid h-[460px] grid-cols-2 grid-rows-2 gap-5 sm:h-[504px] sm:gap-6 lg:grid-cols-4">
                        {SQUIRCLE_FEATURES.filter(
                          (card) => card.group === group.id,
                        )
                          .slice(0, FEATURE_PREVIEW_LIMIT)
                          .map((card, idx) => {
                            const Icon = card.icon;
                            const isHovered = hoveredIdx === idx;

                            return (
                              <div
                                key={card.id}
                                onMouseEnter={() => setHoveredIdx(idx)}
                                onMouseLeave={() => setHoveredIdx(null)}
                                className={`relative rounded-3xl border border-border bg-surface h-[220px] sm:h-[240px] shadow-xs hover:border-primary/40 hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden select-none active:scale-[0.98] ${
                                  idx >= FEATURE_MOBILE_PREVIEW_LIMIT
                                    ? "hidden lg:block"
                                    : ""
                                }`}
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
                                    {t(`items.${card.id}.title`)}
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
                                    {t(`items.${card.id}.title`)}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mt-2.5 max-w-[240px]">
                                    {t(`items.${card.id}.description`)}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </motion.div>
                  </TabsContent>
                );
              })}
            </div>
            <h3 className="text-center text-3xl font-extrabold tracking-tight text-foreground leading-tight sm:text-4xl lg:text-5xl">
              {t("andMore")}
            </h3>
          </Tabs>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
