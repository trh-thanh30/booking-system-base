"use client";

import { useState, useCallback, useEffect } from "react";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
import Image from "next/image";
import { ArrowRight, Check, ChevronLeft, ChevronRight } from "lucide-react";
import {
  LandingSection,
  LandingContainer,
} from "@/src/components/common/landing-compositions";
import { INDUSTRIES_DATA } from "./data/industry-solutions.data";

export function IndustrySolutionsSection() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(false);

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
  }, [emblaApi, onSelect]);

  return (
    <LandingSection
      id="industry-solutions"
      className="scroll-mt-24 py-24 lg:py-32 bg-surface text-foreground font-sans border-b border-border overflow-hidden"
    >
      <LandingContainer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-950 leading-[1.14] text-balance">
            Tailored workflows for
            <br />
            <span className="text-neutral-500 font-bold">
              your exact&nbsp;trade.
            </span>
          </h2>

          <p className="mt-5 text-base sm:text-lg lg:text-xl text-neutral-600 leading-relaxed max-w-3xl mx-auto">
            Whether you run a high-volume salon, a private medical aesthetic
            clinic, or a boutique wellness sanctuary, our platform adapts to
            your booking mechanics.
          </p>
        </div>

        {/* Industry Switcher Tabs + Navigation Buttons */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3 overflow-x-auto pb-1 max-w-full scrollbar-none">
            {INDUSTRIES_DATA.map((ind, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={ind.id}
                  type="button"
                  onClick={() => scrollTo(idx)}
                  className={`shrink-0 px-6 py-3 rounded-full text-sm sm:text-base font-bold transition-all duration-300 cursor-pointer shadow-xs ${
                    isActive
                      ? "bg-neutral-950 text-white border border-neutral-950"
                      : "bg-surface border border-neutral-300 text-neutral-700 hover:border-neutral-400 hover:text-neutral-950 hover:bg-neutral-50"
                  }`}
                >
                  {ind.label}
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
              className="w-12 h-12 rounded-full border border-neutral-300 bg-surface flex items-center justify-center text-neutral-700 hover:bg-neutral-100 hover:border-neutral-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              aria-label="Previous industry"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={scrollNext}
              disabled={nextBtnDisabled}
              className="w-12 h-12 rounded-full border border-neutral-300 bg-surface flex items-center justify-center text-neutral-700 hover:bg-neutral-100 hover:border-neutral-950 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
              aria-label="Next industry"
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
                <div className="rounded-3xl border border-neutral-200 bg-surface shadow-xs overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[640px] sm:min-h-[700px]">
                    {/* Left Column: Industry Highlights & Value Prop */}
                    <div className="lg:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-200">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wider text-neutral-500 block">
                            {ind.badge}
                          </span>
                          <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-neutral-950 tracking-tight leading-tight">
                            {ind.title}
                          </h3>
                          <p className="text-base sm:text-lg text-neutral-600 leading-relaxed pt-1">
                            {ind.description}
                          </p>
                        </div>

                        <div className="space-y-4 pt-3">
                          {ind.highlights.map((item, hIdx) => (
                            <div
                              key={hIdx}
                              className="flex items-start gap-4 text-left"
                            >
                              <div className="w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                                <Check className="w-3.5 h-3.5 text-neutral-950" />
                              </div>
                              <div className="space-y-1">
                                <p className="text-sm sm:text-base font-bold text-neutral-950">
                                  {item.title}
                                </p>
                                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="pt-10">
                        <a
                          href="#faq"
                          className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-full border border-neutral-300 bg-surface hover:bg-neutral-100 text-sm sm:text-base font-bold text-neutral-900 transition-all cursor-pointer shadow-xs"
                        >
                          <span>Explore {ind.label} Setup</span>
                          <ArrowRight className="w-4 h-4 text-neutral-700" />
                        </a>
                      </div>
                    </div>

                    {/* Right Column: Clean Editorial Photography */}
                    <div className="lg:col-span-6 relative min-h-[380px] sm:min-h-[460px] lg:min-h-full overflow-hidden bg-neutral-100 flex items-center justify-center">
                      <Image
                        src={ind.image}
                        alt={ind.title}
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
