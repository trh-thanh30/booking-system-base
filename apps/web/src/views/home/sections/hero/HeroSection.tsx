"use client";

import { useRef } from "react";
import { Sparkles, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useFloating } from "@/src/hooks/useFloating";
import { MotionButton } from "@/src/components/motion/MotionButton";
import { useHeroAutoplay } from "./hooks/useHeroAutoplay";
import { DashboardMockup } from "./components/DashboardMockup";
import { PhoneMockup } from "./components/PhoneMockup";
import { SuccessToast } from "./components/SuccessToast";

export function HeroSection() {
  const dashboardFloating = useFloating({ distance: 8, duration: 6 });
  const mobileFloating = useFloating({ distance: 12, duration: 5 });

  const {
    selectedTimeSlot,
    selectedService,
    bookingsCount,
    revenueAmount,
    isBookingLoading,
    isBooked,
    showToast,
    flashBookings,
    flashRevenue,
    setIsAutoplayPaused,
    handleSelectServiceManual,
    handleSelectSlotManual,
    handleBookManual,
  } = useHeroAutoplay();

  const containerRef = useRef<HTMLDivElement>(null);

  const handleScrollToPricing = () => {
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleScrollToTemplates = () => {
    const el = document.getElementById("templates");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative pt-12 pb-24 lg:pt-20 lg:pb-32 bg-bg-primary overflow-hidden font-sans">
      {/* Glow decorative blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/3 left-10 w-[300px] h-[300px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Grid Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border-light)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border-light)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.25]" />

      <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Hero Content */}
        <div className="lg:col-span-6 space-y-8 flex flex-col justify-center text-center lg:text-left">
          <div className="inline-flex self-center lg:self-start items-center gap-2 px-3 py-1 bg-[#E5F0FF] rounded-full text-brand-blue text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Booking SaaS Platform for Service Businesses</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-text-primary leading-[1.1] max-w-2xl mx-auto lg:mx-0">
            Create an online booking page with{" "}
            <span className="text-brand-blue">your own brand</span>
          </h1>

          <p className="text-base sm:text-lg text-text-muted leading-relaxed max-w-xl mx-auto lg:mx-0">
            Allow customers to self-book 24/7, eliminating manual chats. Manage
            staff, services, availability, and secure deposits on a single
            dashboard.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <MotionButton
              variant="primary"
              className="w-full sm:w-auto h-12 px-8 text-sm font-bold cursor-pointer"
              onClick={handleScrollToPricing}
            >
              Create Your Page Free
            </MotionButton>
            <MotionButton
              variant="secondary"
              className="w-full sm:w-auto h-12 px-8 text-sm font-bold cursor-pointer"
              onClick={handleScrollToTemplates}
            >
              View Demo Page
            </MotionButton>
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-text-muted pt-4 border-t border-border-light">
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>5-minute setup</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>14-day free trial</span>
            </div>
          </div>
        </div>

        {/* Right Hero Interactive Mockups (Autoplay enabled) */}
        <div
          ref={containerRef}
          onMouseEnter={() => setIsAutoplayPaused(true)}
          onMouseLeave={() => setIsAutoplayPaused(false)}
          className="lg:col-span-6 relative h-[450px] sm:h-[520px] w-full max-w-lg mx-auto lg:max-w-none flex items-center justify-center"
        >
          {/* 1. Main Seller Dashboard Mockup (Floating) */}
          <motion.div
            animate={dashboardFloating.animate}
            transition={dashboardFloating.transition}
            className="absolute left-0 top-12 w-[85%] sm:w-[88%] bg-white border border-border-light rounded-[4px] shadow-2xl p-4 z-10 select-none origin-bottom-left"
          >
            <DashboardMockup
              bookingsCount={bookingsCount}
              revenueAmount={revenueAmount}
              flashBookings={flashBookings}
              flashRevenue={flashRevenue}
            />
          </motion.div>

          {/* 2. Customer Phone Booking Mockup (Floating) */}
          <motion.div
            animate={mobileFloating.animate}
            transition={mobileFloating.transition}
            className="absolute right-0 bottom-4 w-[50%] sm:w-[48%] bg-white border border-border-light rounded-[12px] shadow-2xl p-3 z-20 select-none origin-bottom-right"
          >
            <PhoneMockup
              selectedService={selectedService}
              selectedTimeSlot={selectedTimeSlot}
              isBooked={isBooked}
              isBookingLoading={isBookingLoading}
              handleSelectServiceManual={handleSelectServiceManual}
              handleSelectSlotManual={handleSelectSlotManual}
              handleBookManual={handleBookManual}
            />
          </motion.div>

          {/* 3. Floating Success Toast Notification (AnimatePresence added) */}
          <AnimatePresence>
            {showToast && (
              <SuccessToast
                selectedService={selectedService}
                selectedTimeSlot={selectedTimeSlot}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
