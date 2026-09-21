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
      className="min-h-screen lg:h-screen lg:min-h-[720px] flex flex-col justify-between bg-bg-primary border-t border-border-light relative overflow-hidden"
    >
      {/* Top spacing to offset and help center the card container */}
      <div className="hidden lg:block h-6 shrink-0" />

      {/* Main card block */}
      <div className="mx-auto max-w-5xl px-6 w-full flex-1 flex items-center justify-center py-8">
        <div className="relative w-full rounded-xl border border-blue-200/70 bg-gradient-to-br from-[#eff6ff] via-[#f0f7ff] to-[#e0eaff] p-8 sm:p-10 lg:p-12 text-center space-y-6 shadow-[0_24px_80px_-40px_rgba(37,99,235,0.12)] overflow-hidden">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-brand-blue/[0.03] blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-brand-blue/[0.03] blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-4">
            <h2
              className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-text-primary text-balance leading-tight"
              style={{ textWrap: "balance" }}
            >
              Launch your booking website in minutes
            </h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-2xl mx-auto leading-relaxed font-semibold">
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
              className="w-full sm:w-auto inline-flex h-12 px-8 text-sm font-bold items-center justify-center rounded-full bg-brand-blue hover:bg-brand-blue-hover text-white shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer select-none"
            >
              Start 14-day trial
            </motion.button>
            <motion.a
              whileHover={shouldReduceMotion ? undefined : { scale: 1.02 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
              href="mailto:sales@bookingbase.com?subject=BookingBase%20Sales%20Inquiry"
              className="w-full sm:w-auto inline-flex h-12 px-8 text-sm font-bold items-center justify-center rounded-full border border-border-light bg-white hover:bg-bg-secondary hover:border-border-gray text-text-primary transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
            >
              Contact sales
            </motion.a>
          </div>

          <div className="relative z-10 flex flex-wrap items-center justify-center gap-y-2 gap-x-6 text-xs sm:text-sm text-text-muted font-medium pt-2">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-brand-blue" /> 14-day trial
              included
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-brand-blue" /> No credit card
              required
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-brand-blue" /> Cancel anytime
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
