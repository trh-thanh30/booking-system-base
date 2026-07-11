"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import useEmblaCarousel, { UseEmblaCarouselType } from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { MotionCard } from "@/src/components/motion/MotionCard";
import { INDUSTRIES } from "../home.constants";

interface IndustriesProps {
  activeTemplateIdx: number;
  setActiveTemplateIdx: (idx: number) => void;
}

export function Industries({
  activeTemplateIdx,
  setActiveTemplateIdx,
}: IndustriesProps) {
  const autoplay = useRef(
    Autoplay({ delay: 5000, stopOnInteraction: false, stopOnMouseEnter: true }),
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", slidesToScroll: "auto" },
    [autoplay.current],
  );

  const [prevBtnDisabled, setPrevBtnDisabled] = useState(true);
  const [nextBtnDisabled, setNextBtnDisabled] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([]);
  const [isAutoplayPaused, setIsAutoplayPaused] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      autoplay.current.reset();
    }
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      autoplay.current.reset();
    }
  }, [emblaApi]);

  const onSelect = useCallback(
    (api: NonNullable<UseEmblaCarouselType[1]>) => {
      const snapIndex = api.selectedScrollSnap();
      setSelectedIndex(snapIndex);
      setPrevBtnDisabled(!api.canScrollPrev());
      setNextBtnDisabled(!api.canScrollNext());

      // Auto-update activeTemplateIdx to match the selected index in home view
      if (snapIndex >= 0 && snapIndex < INDUSTRIES.length) {
        const currentIndustryId = INDUSTRIES[snapIndex]?.id || "";
        const templateIndices: Record<string, number> = {
          beauty: 0,
          healthcare: 1,
          fitness: 2,
          consulting: 3,
          education: 4,
          repair: 5,
        };
        const idx = templateIndices[currentIndustryId];
        if (idx !== undefined) {
          setActiveTemplateIdx(idx);
        }
      }
    },
    [setActiveTemplateIdx],
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect(emblaApi);
    setScrollSnaps(emblaApi.scrollSnapList());
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  // Autoplay Event Listeners to sync status indicators and play states
  useEffect(() => {
    if (!emblaApi) return;

    const onPlay = () => setIsAutoplayPaused(false);
    const onStop = () => setIsAutoplayPaused(true);

    emblaApi.on("autoplay:play", onPlay);
    emblaApi.on("autoplay:stop", onStop);

    // Initial state
    setIsAutoplayPaused(!autoplay.current.isPlaying());

    return () => {
      emblaApi.off("autoplay:play", onPlay);
      emblaApi.off("autoplay:stop", onStop);
    };
  }, [emblaApi]);

  // Sync scroll position when template index changes from templates section
  useEffect(() => {
    if (!emblaApi) return;
    const currentSnap = emblaApi.selectedScrollSnap();
    if (
      currentSnap !== activeTemplateIdx &&
      activeTemplateIdx >= 0 &&
      activeTemplateIdx < INDUSTRIES.length
    ) {
      emblaApi.scrollTo(activeTemplateIdx);
      autoplay.current.reset();
    }
  }, [emblaApi, activeTemplateIdx]);

  const handleSeeWorkflow = (id: string) => {
    const templateIndices: Record<string, number> = {
      beauty: 0,
      healthcare: 1,
      fitness: 2,
      consulting: 3,
      education: 4,
      repair: 5,
    };
    const idx = templateIndices[id];
    if (idx !== undefined) {
      setActiveTemplateIdx(idx);
      if (emblaApi) {
        emblaApi.scrollTo(idx);
        autoplay.current.reset();
      }
    }
    const el = document.getElementById("templates");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <RepeatReveal
      as="section"
      id="industries"
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-bg-primary border-t border-border-light overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-3xl">
            <span className="text-xs font-bold tracking-wider text-brand-blue uppercase">
              Supported Industries
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
              Designed for any service-based business
            </h2>
            <p className="text-text-muted text-base">
              From solo providers to growing service teams, BookingBase adapts
              to your services, staff, schedules and booking rules.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            {/* Pagination snaps dot list */}
            <div className="flex items-center gap-1.5 select-none mx-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => {
                    if (emblaApi) {
                      emblaApi.scrollTo(index);
                      autoplay.current.reset();
                    }
                  }}
                  className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                    selectedIndex === index
                      ? "bg-brand-blue w-4"
                      : "bg-border-light hover:bg-text-muted/30 w-1.5"
                  }`}
                  aria-label={`Go to slide page ${index + 1}`}
                />
              ))}
            </div>

            {/* Navigation buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={prevBtnDisabled}
                onClick={scrollPrev}
                aria-label="Previous page"
                className="w-9 h-9 rounded-lg border border-border-light flex items-center justify-center transition-all bg-white text-text-secondary hover:text-brand-blue cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={nextBtnDisabled}
                onClick={scrollNext}
                aria-label="Next page"
                className="w-9 h-9 rounded-lg border border-border-light flex items-center justify-center transition-all bg-white text-text-secondary hover:text-brand-blue cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-sm active:scale-[0.98]"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel Tracks */}
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex -ml-6">
            {INDUSTRIES.map((ind, idx) => {
              const isActive = activeTemplateIdx === idx;
              return (
                <div
                  key={ind.id || idx}
                  className="flex-[0_0_100%] sm:flex-[0_0_50%] lg:flex-[0_0_33.333333%] min-w-0 pl-6 h-full"
                >
                  <MotionCard
                    onClick={() => {
                      const templateIndices: Record<string, number> = {
                        beauty: 0,
                        healthcare: 1,
                        fitness: 2,
                        consulting: 3,
                        education: 4,
                        repair: 5,
                      };
                      const targetIdx = templateIndices[ind.id || ""];
                      if (targetIdx !== undefined && emblaApi) {
                        emblaApi.scrollTo(targetIdx);
                        autoplay.current.reset();
                      }
                    }}
                    className={`h-full !p-0 overflow-hidden transition-all duration-300 bg-white group flex flex-col min-h-[420px] cursor-pointer border relative select-none ${
                      isActive ? "shadow-md" : "hover:border-brand-blue/30"
                    }`}
                    style={{
                      borderColor: isActive ? "#2563eb" : undefined,
                      boxShadow: isActive ? "0 0 0 1px #2563eb" : undefined,
                    }}
                  >
                    {/* Autoplay progress bar running along active industry card */}
                    {isActive && (
                      <div
                        key={selectedIndex}
                        style={{
                          animationDuration: "5000ms",
                          animationPlayState: isAutoplayPaused
                            ? "paused"
                            : "running",
                          transformOrigin: "left",
                        }}
                        className="absolute top-0 left-0 right-0 h-1 bg-brand-blue animate-progress-bar z-10"
                      />
                    )}

                    <div className="relative h-44 sm:h-48 overflow-hidden bg-bg-secondary w-full">
                      <Image
                        src={ind.image}
                        alt={ind.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-102 transition-transform duration-500"
                        priority={idx < 3}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />
                    </div>

                    <div className="p-6 flex-grow flex flex-col justify-between">
                      <div className="space-y-3">
                        <h3
                          className={`text-base font-bold transition-colors ${
                            isActive
                              ? "text-brand-blue"
                              : "text-text-primary group-hover:text-brand-blue"
                          }`}
                        >
                          {ind.name}
                        </h3>
                        <p className="text-xs text-text-muted leading-relaxed min-h-[54px]">
                          {ind.desc}
                        </p>
                        <div className="flex flex-wrap gap-1.5 pt-1 min-h-[26px]">
                          {ind.chips?.map((chip) => (
                            <span
                              key={chip}
                              className="text-[9px] px-2.5 py-0.5 rounded-full bg-[#F8FAFC] border border-border-light text-text-secondary font-medium"
                            >
                              {chip}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-5 mt-auto">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSeeWorkflow(ind.id || "");
                          }}
                          className="inline-flex items-center text-[11px] text-brand-blue font-bold gap-1 group-hover:underline cursor-pointer bg-transparent border-none p-0 focus:outline-none"
                        >
                          See workflow &rarr;
                        </button>
                      </div>
                    </div>
                  </MotionCard>
                </div>
              );
            })}
          </div>
        </div>

        <div className="text-center mt-12 border-t border-border-light/50 pt-8">
          <p className="text-xs text-text-muted max-w-md mx-auto leading-relaxed">
            Every industry template can be customized with your services, brand
            colors, staff and booking rules.
          </p>
        </div>
      </div>
    </RepeatReveal>
  );
}
