"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useReducedMotion } from "framer-motion";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  LandingSection,
  LandingContainer,
} from "@/src/components/common/landing-compositions";
import { INDUSTRIES_DATA } from "./data/industry-solutions.data";

export function IndustrySolutionsSection() {
  const t = useTranslations("landing_page_home.industrySolutions");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);
  const tabsRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    slidesToScroll: 1,
    duration: 25,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  const scrollTo = useCallback(
    (index: number) => {
      if (emblaApi) emblaApi.scrollTo(index);
    },
    [emblaApi],
  );

  const onSelect = useCallback((api: NonNullable<UseEmblaCarouselType[1]>) => {
    setSelectedIndex(api.selectedScrollSnap());
    setPrevBtnDisabled(!api.canScrollPrev());
    setNextBtnDisabled(!api.canScrollNext());
  }, []);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);

    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollActiveTabIntoView = useCallback((behavior: ScrollBehavior) => {
    const tabs = tabsRef.current;
    const activeTab = tabs?.querySelector<HTMLButtonElement>(
      '[aria-pressed="true"]',
    );
    if (!tabs || !activeTab) return;

    const tabBounds = activeTab.getBoundingClientRect();
    const tabsBounds = tabs.getBoundingClientRect();
    if (
      tabBounds.left >= tabsBounds.left + 4 &&
      tabBounds.right <= tabsBounds.right - 4
    ) {
      return;
    }

    tabs.scrollTo({
      left:
        tabs.scrollLeft +
        tabBounds.left -
        tabsBounds.left -
        (tabs.clientWidth - tabBounds.width) / 2,
      behavior,
    });
  }, []);

  useEffect(() => {
    scrollActiveTabIntoView(shouldReduceMotion ? "instant" : "smooth");
  }, [selectedIndex, shouldReduceMotion, scrollActiveTabIntoView]);

  useEffect(() => {
    const tabs = tabsRef.current;
    if (!tabs) return;

    const observer = new ResizeObserver(() => {
      scrollActiveTabIntoView("instant");
    });
    observer.observe(tabs);
    return () => observer.disconnect();
  }, [scrollActiveTabIntoView]);

  return (
    <LandingSection
      id="industry-solutions"
      className="scroll-mt-24 py-24 lg:py-32 bg-surface bg-gradient-to-br from-accent from-50% to-surface text-foreground font-sans overflow-hidden"
    >
      <LandingContainer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.14] text-balance">
            {t.rich("title", {
              br: () => <br />,
              highlight: (chunks) => (
                <span className="text-muted-foreground font-bold">
                  {chunks}
                </span>
              ),
            })}
          </h2>

          <p className="mt-5 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Industry Switcher Tabs + Navigation Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div
            ref={tabsRef}
            className="flex min-w-0 items-center gap-3 overflow-x-auto p-1 max-w-full scrollbar-none"
          >
            {INDUSTRIES_DATA.map((ind, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={ind.id}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => scrollTo(idx)}
                  className={`shrink-0 px-6 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 cursor-pointer shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                    isActive
                      ? "bg-primary text-primary-foreground border border-primary"
                      : "bg-surface border border-input text-foreground hover:border-primary/40 hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {t(ind.labelKey)}
                </button>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <div className="hidden sm:flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={scrollPrev}
              disabled={prevBtnDisabled}
              className="w-12 h-12 rounded-full border border-input bg-surface flex items-center justify-center text-foreground hover:bg-muted hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              aria-label={t("previous")}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className="w-12 h-12 rounded-full border border-input bg-surface flex items-center justify-center text-foreground hover:bg-muted hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              aria-label={t("next")}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embla Carousel Viewport */}
        <div className="mt-10 overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y -ml-6">
            {INDUSTRIES_DATA.map((ind, idx) => (
              <div key={ind.id} className="min-w-0 flex-[0_0_100%] pl-6">
                <div className="rounded-3xl border border-border bg-surface shadow-xs overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[640px] sm:min-h-[700px]">
                    {/* Left Column: Industry Highlights & Value Prop */}
                    <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-muted-foreground block">
                            {t(ind.badgeKey)}
                          </span>
                          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
                            {t(ind.titleKey)}
                          </h3>
                          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed pt-1">
                            {t(ind.descriptionKey)}
                          </p>
                        </div>

                        <div className="space-y-4 pt-3">
                          {ind.highlights.map((item, hIdx) => (
                            <div
                              key={hIdx}
                              className="flex items-start gap-4 text-left"
                            >
                              <div className="w-6 h-6 rounded-full bg-accent border border-border flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3.5 h-3.5 text-primary" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm sm:text-base font-bold text-foreground">
                                  {t(item.titleKey)}
                                </p>
                                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                                  {t(item.descriptionKey)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-10">
                        <a
                          href="#faq"
                          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-input bg-surface hover:bg-muted text-sm sm:text-base font-bold text-foreground transition-all cursor-pointer shadow-xs"
                        >
                          <span>
                            {t("explore", { industry: t(ind.labelKey) })}
                          </span>
                          <ArrowRight className="w-4 h-4 text-foreground" />
                        </a>
                      </div>
                    </div>

                    {/* Right Column: Clean Editorial Photography */}
                    <div className="lg:col-span-6 relative min-h-[380px] sm:min-h-[460px] lg:min-h-full overflow-hidden bg-muted flex items-center justify-center">
                      <Image
                        src={ind.image}
                        alt={t(ind.titleKey)}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                        priority={idx === 0}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
