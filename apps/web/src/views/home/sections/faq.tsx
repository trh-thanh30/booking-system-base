"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/src/components/motion/Reveal";
import { FAQ_GROUPS } from "../home.constants";

export function FAQ() {
  const [openFaqKey, setOpenFaqKey] = useState<string | null>("coding-skills");
  const shouldReduceMotion = useReducedMotion();

  const handleScrollToGroup = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Reveal
      as="section"
      id="faq"
      className="scroll-mt-20 md:scroll-mt-24 py-10 md:py-12 lg:py-14 bg-bg-primary border-t border-border-light"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-8 space-y-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/50 px-3.5 py-0.5 text-[10px] font-bold text-brand-blue uppercase tracking-wider select-none">
            Frequently Asked Questions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-text-primary tracking-tight">
            Questions before you start?
          </h2>
          <p className="text-text-muted text-xs leading-relaxed max-w-lg mx-auto">
            Find quick answers about templates, booking pages, payments, trials
            and Early Access.
          </p>
        </div>

        {/* Anchor Jump Links */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap select-none">
          <button
            type="button"
            onClick={() => handleScrollToGroup("faq-product")}
            className="px-4 py-1.5 rounded-full border border-border-light bg-white text-xs font-bold text-text-muted hover:bg-blue-50/50 hover:text-brand-blue hover:border-brand-blue/30 shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Jump to Product & Booking ↓
          </button>
          <button
            type="button"
            onClick={() => handleScrollToGroup("faq-trial")}
            className="px-4 py-1.5 rounded-full border border-border-light bg-white text-xs font-bold text-text-muted hover:bg-blue-50/50 hover:text-brand-blue hover:border-brand-blue/30 shadow-sm transition-all duration-200 cursor-pointer active:scale-[0.98]"
          >
            Jump to Trial & Early Access ↓
          </button>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto mb-10">
          {FAQ_GROUPS.map((group, gidx) => (
            <div
              key={gidx}
              id={gidx === 0 ? "faq-product" : "faq-trial"}
              className="space-y-4 scroll-mt-28"
            >
              <h3 className="text-sm sm:text-base font-extrabold text-text-primary border-b border-border-light pb-2 select-none">
                {group.title}
              </h3>
              <div className="space-y-2.5">
                {group.items.map((faq) => {
                  const isOpen = openFaqKey === faq.id;
                  const panelId = `faq-panel-${faq.id}`;
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-xl border p-4 transition-all duration-300 ${
                        isOpen
                          ? "border-brand-blue bg-blue-50/15 shadow-sm"
                          : "border-border-light bg-bg-primary hover:border-border-gray"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqKey(isOpen ? null : faq.id)}
                        className="flex w-full items-center justify-between gap-4 text-left focus:outline-none cursor-pointer rounded-lg select-none"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                      >
                        <span
                          className={`text-sm sm:text-[15px] font-semibold transition-colors duration-200 ${
                            isOpen ? "text-brand-blue" : "text-text-primary"
                          }`}
                        >
                          {faq.question}
                        </span>
                        <motion.span
                          animate={
                            shouldReduceMotion
                              ? { rotate: 0 }
                              : { rotate: isOpen ? 180 : 0 }
                          }
                          transition={{
                            duration: shouldReduceMotion ? 0 : 0.2,
                            ease: "easeOut",
                          }}
                          className={`shrink-0 transition-colors duration-200 ${
                            isOpen ? "text-brand-blue" : "text-text-muted"
                          }`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </motion.span>
                      </button>
                      <AnimatePresence initial={false}>
                        {isOpen && (
                          <motion.div
                            id={panelId}
                            initial={
                              shouldReduceMotion
                                ? { height: "auto", opacity: 1 }
                                : { height: 0, opacity: 0 }
                            }
                            animate={{ height: "auto", opacity: 1 }}
                            exit={
                              shouldReduceMotion
                                ? { height: "auto", opacity: 1 }
                                : { height: 0, opacity: 0 }
                            }
                            transition={{
                              duration: shouldReduceMotion ? 0 : 0.2,
                              ease: "easeOut",
                            }}
                            className="overflow-hidden"
                          >
                            <p className="pt-3 text-xs sm:text-[14px] text-text-muted leading-relaxed">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* FAQ CTA Card */}
        <div className="text-center border border-border-light bg-white p-7 rounded-xl shadow-sm space-y-4 max-w-6xl mx-auto mt-10">
          <h3 className="text-lg font-bold text-text-primary">
            Still have questions?
          </h3>
          <p className="text-sm text-text-muted max-w-[480px] mx-auto leading-relaxed">
            Reach our support team, or book a 15-minute walkthrough with a
            product specialist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <motion.button
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              onClick={() =>
                (window.location.href =
                  "mailto:support@bookingbase.com?subject=BookingBase%20Support%20Inquiry")
              }
              className="w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white shadow-sm hover:shadow px-6 text-sm font-semibold transition-all duration-200 cursor-pointer select-none"
            >
              Contact support
            </motion.button>
            <motion.a
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              href="mailto:demo@bookingbase.com?subject=BookingBase%20Demo%20Request"
              className="w-full sm:w-auto inline-flex h-10 items-center justify-center rounded-full border border-border-light bg-white hover:bg-bg-secondary hover:border-border-gray px-6 text-sm font-semibold transition-all duration-200 cursor-pointer select-none"
            >
              Book a demo
            </motion.a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
