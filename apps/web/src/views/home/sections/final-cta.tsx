"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/src/components/motion/Reveal";
import { Footer } from "./footer";

function getSignupPath() {
  const locale = window.location.pathname.split("/").filter(Boolean)[0] || "vi";
  return `/${locale}/signup-business`;
}

export function FinalCTA() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <Reveal
      as="section"
      className="min-h-screen lg:h-screen lg:min-h-[760px] flex flex-col justify-between bg-surface border-t border-border relative overflow-hidden"
    >
      {/* Top spacing to offset and help center the card container */}
      <div className="hidden lg:block h-6 shrink-0" />

      {/* Main card block */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full flex-1 flex items-center justify-center py-12 sm:py-16">
        <div className="relative w-full rounded-3xl border border-neutral-800 bg-neutral-950 text-white p-10 sm:p-16 lg:p-20 text-center space-y-8 sm:space-y-10 shadow-2xl overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-neutral-800/20 blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-neutral-800/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl mx-auto space-y-4">
            <h2
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold tracking-tight text-white text-balance leading-[1.08]"
              style={{ textWrap: "balance" }}
            >
              Launch your booking website in minutes
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto leading-relaxed font-normal">
              Ready-made templates. Custom services. No back-and-forth.
            </p>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              onClick={() => {
                window.location.assign(getSignupPath());
              }}
              className="w-full sm:w-auto inline-flex h-14 px-10 text-base sm:text-lg font-bold items-center justify-center rounded-full bg-white hover:bg-neutral-100 text-neutral-950 shadow-md transition-all duration-200 cursor-pointer select-none"
            >
              Start 14-day trial
            </motion.button>
            <motion.a
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              href="mailto:sales@bookingbase.com?subject=BookingBase%20Sales%20Inquiry"
              className="w-full sm:w-auto inline-flex h-14 px-10 text-base sm:text-lg font-bold items-center justify-center rounded-full border border-neutral-700 bg-neutral-900/80 hover:bg-neutral-800 text-white transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
            >
              Contact sales
            </motion.a>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-y-3 gap-x-8 text-sm sm:text-base text-neutral-400 font-medium pt-2">
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-white" /> 14-day trial included
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-white" /> No credit card required
            </span>
            <span className="flex items-center gap-2">
              <Check className="w-5 h-5 text-white" /> Cancel anytime
            </span>
          </div>
        </div>
      </div>

      {/* Embedded footer at the bottom of the section */}
      <div className="w-full shrink-0">
        <Footer />
      </div>
    </Reveal>
  );
}
