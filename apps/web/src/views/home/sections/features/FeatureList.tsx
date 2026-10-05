"use client";

import { ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { FeatureMeta, FeatureTab } from "./types/features.types";
import { useScrollToActive } from "./hooks/useScrollToActive";

interface Props {
  features: FeatureMeta[];
  activeTab: FeatureTab;
  onSelect: (tab: FeatureTab) => void;
}

export function FeatureList({ features, activeTab, onSelect }: Props) {
  const { containerRef, setItemRef } = useScrollToActive<FeatureTab>(
    activeTab,
    120,
  );

  return (
    <div className="relative w-full h-auto lg:h-[560px] rounded-3xl border border-border bg-surface/20 p-2 overflow-hidden shadow-inner">
      {/* Top fade gradient - Desktop only */}
      <div className="hidden lg:block absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-background via-background/75 to-transparent pointer-events-none z-10" />

      {/* Bottom fade gradient - Desktop only */}
      <div className="hidden lg:block absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-background via-background/75 to-transparent pointer-events-none z-10" />

      {/* Scrollable list container - Scrolls on desktop, full display on mobile */}
      <div
        ref={containerRef}
        className="h-full w-full overflow-y-visible lg:overflow-y-auto scroll-smooth lg:scrollbar-none py-2 lg:py-10 px-1 lg:px-2 space-y-2.5 lg:space-y-3 flex flex-col relative lg:snap-y lg:snap-mandatory lg:scroll-py-10"
      >
        {features.map((feat) => {
          const Icon = feat.icon;
          const isActive = feat.id === activeTab;

          return (
            <button
              key={feat.id}
              ref={setItemRef(feat.id)}
              type="button"
              onClick={() => onSelect(feat.id)}
              className={`group relative grid grid-cols-[auto_1fr_auto] items-start gap-4 overflow-hidden rounded-2xl border bg-surface text-left transition-all duration-300 cursor-pointer w-full shrink-0 lg:snap-center ${
                isActive
                  ? "p-5 border-primary bg-gradient-to-r from-primary/5 to-surface shadow-md scale-[1.01] z-20"
                  : "py-3.5 px-5 border-border/60 opacity-60 hover:opacity-100 hover:border-input/60"
              }`}
            >
              {/* Active left bar */}
              <span
                className={`absolute left-0 top-0 bottom-0 w-[3.5px] bg-primary transition-transform duration-350 ${
                  isActive ? "scale-y-100" : "scale-y-0"
                }`}
              />

              {/* Left Icon Container */}
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all duration-300 shrink-0 ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-accent/40 text-primary group-hover:bg-primary group-hover:text-primary-foreground"
                }`}
              >
                <Icon className="h-4.5 w-4.5 stroke-[2]" />
              </div>

              {/* Middle Content */}
              <div className="min-w-0 pr-1 flex flex-col justify-center">
                <div
                  className={`text-[14px] font-extrabold text-foreground tracking-[-0.01em] transition-all duration-300 ${
                    !isActive ? "py-1.5" : "text-[14.5px]"
                  }`}
                >
                  {feat.title}
                </div>

                {/* Collapsible details */}
                <AnimatePresence initial={false}>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="text-[11.5px] leading-relaxed text-muted-foreground mt-1.5">
                        {feat.desc}
                      </p>

                      {/* Tags */}
                      <div className="mt-3 flex flex-wrap gap-1.5 pb-0.5">
                        {feat.pills.map((pill, idx) => (
                          <span
                            key={idx}
                            className="rounded-full border bg-surface/80 border-primary/20 px-2 py-0.5 text-[8.5px] font-bold leading-none text-primary"
                          >
                            {pill}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Right Arrow */}
              <div className="flex h-9 items-center shrink-0">
                <ChevronRight
                  className={`h-4.5 w-4.5 transition-transform duration-300 ${
                    isActive
                      ? "translate-x-0.5 text-primary"
                      : "text-border group-hover:text-muted-foreground"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
