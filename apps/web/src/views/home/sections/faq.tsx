"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/src/components/motion/Reveal";
import { FAQ_GROUPS } from "../constants/home.constants";

export function FAQ() {
  const [openFaqKey, setOpenFaqKey] = useState<string | null>("coding-skills");
  const shouldReduceMotion = useReducedMotion();

  return (
    <Reveal
      as="section"
      id="faq"
      className="scroll-mt-20 md:scroll-mt-24 py-24 lg:py-32 bg-surface bg-gradient-to-br from-accent from-50% to-surface"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-5xl mx-auto mb-14 sm:mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground tracking-tight leading-[1.12] text-balance">
            Questions before you&nbsp;start?
          </h2>
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Find quick answers about templates, booking pages, payments, trials
            and platform features.
          </p>
        </div>

        {/* FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start w-full mx-auto mb-12">
          {FAQ_GROUPS.map((group, gidx) => (
            <div
              key={gidx}
              id={gidx === 0 ? "faq-product" : "faq-trial"}
              className="space-y-5 scroll-mt-28"
            >
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground border-b border-border pb-3.5 select-none">
                {group.title}
              </h3>
              <div className="space-y-4">
                {group.items.map((faq) => {
                  const isOpen = openFaqKey === faq.id;
                  const panelId = `faq-panel-${faq.id}`;
                  return (
                    <div
                      key={faq.id}
                      className={`rounded-3xl border p-6 sm:p-7 transition-all duration-300 ${
                        isOpen
                          ? "border-primary bg-muted/70 shadow-sm"
                          : "border-border bg-surface hover:border-primary/40 shadow-2xs"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaqKey(isOpen ? null : faq.id)}
                        className="flex w-full items-center justify-between gap-4 text-left focus-visible:outline-2 focus-visible:outline-ring cursor-pointer rounded-lg select-none"
                        aria-expanded={isOpen}
                        aria-controls={panelId}
                      >
                        <span
                          className={`text-base sm:text-lg font-bold transition-colors duration-200 ${
                            isOpen ? "text-primary" : "text-foreground"
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
                            isOpen ? "text-primary" : "text-muted-foreground"
                          }`}
                        >
                          <ChevronDown className="h-5 w-5" />
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
                            <p className="pt-4 text-base text-muted-foreground leading-relaxed">
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
        <div className="text-center border border-border bg-muted/70 p-10 sm:p-14 rounded-3xl shadow-xs space-y-5 max-w-7xl mx-auto mt-14">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Still have questions?
          </h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Reach our support team, or book a 15-minute walkthrough with a
            product specialist.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
            <motion.button
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              onClick={() =>
                (window.location.href =
                  "mailto:support@bookingbase.com?subject=BookingBase%20Support%20Inquiry")
              }
              className="w-full sm:w-auto inline-flex h-13 items-center justify-center rounded-full bg-primary hover:bg-primary-hover text-primary-foreground shadow-sm px-8 text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer select-none"
            >
              Contact support
            </motion.button>
            <motion.a
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              href="mailto:demo@bookingbase.com?subject=BookingBase%20Demo%20Request"
              className="w-full sm:w-auto inline-flex h-13 items-center justify-center rounded-full border border-input bg-surface hover:bg-muted px-8 text-sm sm:text-base font-bold text-foreground transition-all duration-200 cursor-pointer select-none"
            >
              Book a demo
            </motion.a>
          </div>
        </div>
      </div>
    </Reveal>
  );
}
