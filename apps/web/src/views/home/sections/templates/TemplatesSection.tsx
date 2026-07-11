"use client";

import { useState } from "react";
import { Check, ArrowDown } from "lucide-react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { WEBSITE_TEMPLATES } from "../../home.constants";
import { TEMPLATE_COLORS, FILTERS } from "./templates.constants";
import { DesktopBrowserMockup } from "./components/DesktopBrowserMockup";
import { MobileMockup } from "./components/MobileMockup";

interface TemplatesSectionProps {
  activeTemplateIdx: number;
  setActiveTemplateIdx: (idx: number) => void;
}

export function TemplatesSection({
  activeTemplateIdx,
  setActiveTemplateIdx,
}: TemplatesSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [templateSelectedServiceIdx, setTemplateSelectedServiceIdx] =
    useState<number>(0);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const activeTemplate = (WEBSITE_TEMPLATES[activeTemplateIdx] ||
    WEBSITE_TEMPLATES[0])!;
  const activeColor = TEMPLATE_COLORS[activeTemplate.id] || "#3b82f6";

  const handleFilterChange = (filterId: string) => {
    setActiveFilter(filterId);

    // Find the first template in the newly selected filter to update active preview
    const filtered = WEBSITE_TEMPLATES.filter((tmpl) => {
      if (filterId === "all") return true;
      if (filterId === "beauty") return tmpl.id === "beauty";
      if (filterId === "health") return tmpl.id === "healthcare";
      if (filterId === "fitness") return tmpl.id === "fitness";
      if (filterId === "education") return tmpl.id === "education";
      if (filterId === "services")
        return tmpl.id === "consulting" || tmpl.id === "repair";
      return true;
    });

    if (filtered.length > 0) {
      const originalIdx = WEBSITE_TEMPLATES.findIndex(
        (t) => t.id === filtered[0]?.id,
      );
      if (originalIdx !== -1) {
        setActiveTemplateIdx(originalIdx);
        setTemplateSelectedServiceIdx(0);
      }
    }
  };

  return (
    <RepeatReveal
      as="section"
      id="templates"
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-bg-secondary border-t border-border-light font-sans"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3.5">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-brand-blue">
            Website Templates
          </span>
          <h2 className="text-[28px] sm:text-[34px] lg:text-[40px] font-extrabold leading-[1.15] tracking-[-0.02em] text-text-primary">
            Choose a website template built for your service business
          </h2>
          <p className="text-[15.5px] leading-relaxed text-text-muted">
            Pick a template designed for your industry, then customize the
            layout, services, branding and booking flow to match your business.
          </p>
        </div>

        {/* Categories / Filter Chips */}
        <div className="flex gap-2 justify-start flex-wrap mb-6.5 select-none max-w-7xl mx-auto">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => handleFilterChange(filter.id)}
              className={`px-4.5 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.01] active:scale-[0.98] ${
                activeFilter === filter.id
                  ? "bg-text-primary border-text-primary text-white"
                  : "bg-white border-border-light text-text-muted hover:border-brand-blue hover:text-brand-blue"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* 2-column layout (Original layout ratio: Left 7 cols, Right 5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-7xl mx-auto">
          {/* Left Column: Template Cards List */}
          <div className="lg:col-span-7 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {WEBSITE_TEMPLATES.map((tmpl, idx) => {
                const isVisible =
                  activeFilter === "all" ||
                  (activeFilter === "beauty" && tmpl.id === "beauty") ||
                  (activeFilter === "health" && tmpl.id === "healthcare") ||
                  (activeFilter === "fitness" && tmpl.id === "fitness") ||
                  (activeFilter === "education" && tmpl.id === "education") ||
                  (activeFilter === "services" &&
                    (tmpl.id === "consulting" || tmpl.id === "repair"));

                if (!isVisible) return null;

                const Icon = tmpl.icon;
                const isActive = activeTemplateIdx === idx;
                const tmplColor = TEMPLATE_COLORS[tmpl.id] || "#3b82f6";

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setActiveTemplateIdx(idx);
                      setTemplateSelectedServiceIdx(0);
                    }}
                    aria-pressed={isActive}
                    style={{
                      borderColor: isActive ? tmplColor : undefined,
                      boxShadow: isActive
                        ? `0 0 0 3px ${tmplColor}15`
                        : undefined,
                    }}
                    className={`text-left cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                      isActive
                        ? "bg-white"
                        : "border-border-light bg-white/70 hover:border-border-gray hover:bg-white hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          style={{
                            backgroundColor: isActive
                              ? `${tmplColor}1a`
                              : undefined,
                            color: isActive ? tmplColor : undefined,
                          }}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                            !isActive ? "bg-bg-secondary text-text-muted" : ""
                          }`}
                        >
                          <Icon className="w-5 h-5 stroke-[2]" />
                        </div>
                        <h3 className="text-sm font-extrabold text-text-primary tracking-tight">
                          {tmpl.templateName}
                        </h3>
                      </div>
                      {isActive && (
                        <span
                          style={{ backgroundColor: tmplColor }}
                          className="w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-text-muted mb-4 leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {tmpl.chips.map((chip, cidx) => (
                        <span
                          key={cidx}
                          className="text-[9px] bg-bg-secondary text-text-muted px-2 py-0.5 rounded-full font-bold border border-border-light/45"
                        >
                          {chip}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border-light/40">
                      <span
                        style={{ color: tmplColor }}
                        className="text-xs font-bold hover:underline"
                      >
                        Preview website
                      </span>
                      <span
                        style={{
                          backgroundColor: isActive ? tmplColor : undefined,
                          color: isActive ? "#ffffff" : undefined,
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-[6px] font-bold ${
                          !isActive ? "bg-bg-secondary text-text-muted" : ""
                        }`}
                      >
                        {isActive ? "Selected" : "Select"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Dynamic Live Preview */}
          <div className="lg:col-span-5 flex flex-col items-center w-full">
            <span className="text-[10.5px] font-extrabold uppercase tracking-wider text-text-muted mb-4 block select-none">
              Live website template preview
            </span>

            {/* ====== DESKTOP PREVIEW WINDOW: Visible only on Desktop (lg) ====== */}
            <DesktopBrowserMockup
              activeTemplateIdx={activeTemplateIdx}
              activeTemplate={activeTemplate}
              activeColor={activeColor}
              templateSelectedServiceIdx={templateSelectedServiceIdx}
              setTemplateSelectedServiceIdx={setTemplateSelectedServiceIdx}
              shouldReduceMotion={shouldReduceMotion ?? false}
            />

            {/* ====== MOBILE PHONE MOCKUP FRAME: Visible only on Mobile/Tablet (lg:hidden) ====== */}
            <AnimatePresence mode="wait">
              <MobileMockup
                activeTemplateIdx={activeTemplateIdx}
                activeTemplate={activeTemplate}
                activeColor={activeColor}
                templateSelectedServiceIdx={templateSelectedServiceIdx}
                setTemplateSelectedServiceIdx={setTemplateSelectedServiceIdx}
                shouldReduceMotion={shouldReduceMotion ?? false}
              />
            </AnimatePresence>

            {/* Seller Action CTA placed outside the mockup */}
            <div className="mt-6 flex flex-col items-center select-none w-full max-w-[300px]">
              <a
                href="#customization"
                style={{ backgroundColor: activeColor }}
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 hover:opacity-95 text-white text-xs font-bold rounded-full shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer w-full"
              >
                <span>Customize this template</span>
                <ArrowDown className="w-3.5 h-3.5 stroke-[2]" />
              </a>
              <span className="text-[10px] text-text-muted mt-2 text-center">
                Adjust colors, brand name & booking rules below
              </span>
            </div>
          </div>
        </div>
      </div>
    </RepeatReveal>
  );
}
