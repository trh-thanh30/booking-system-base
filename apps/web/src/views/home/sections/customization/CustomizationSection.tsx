"use client";

import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Star,
  FileText,
  Grid,
  Check,
} from "lucide-react";
import { LandingSection } from "@/src/components/common/landing-compositions";

export function CustomizationSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    dragFree: true,
  });

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <LandingSection
      id="customization"
      className="scroll-mt-24 py-24 lg:py-32 bg-surface text-foreground font-sans border-b border-border overflow-hidden"
    >
      {/* Centered Section Header */}
      <div className="max-w-5xl mx-auto px-4 text-center space-y-4 mb-14 sm:mb-16">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12] text-balance">
          Endless{" "}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary-hover to-primary-active">
            customisation
          </span>
          {"\u00A0"}options
        </h2>
        <p className="mt-5 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
          Turn a generic scheduling link into a high-converting, branded
          mini-site with modular interactive widgets.
        </p>

        {/* Carousel Navigation Controls */}
        <div className="flex items-center justify-center gap-4 pt-3">
          <button
            type="button"
            onClick={scrollPrev}
            className="w-12 h-12 rounded-full border border-input bg-surface hover:bg-muted flex items-center justify-center text-foreground transition-colors shadow-xs active:scale-95 cursor-pointer"
            aria-label="Previous customization slide"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm font-semibold text-muted-foreground px-2">
            Drag or swipe to explore
          </span>
          <button
            type="button"
            onClick={scrollNext}
            className="w-12 h-12 rounded-full border border-input bg-surface hover:bg-muted flex items-center justify-center text-foreground transition-colors shadow-xs active:scale-95 cursor-pointer"
            aria-label="Next customization slide"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Full-bleed Carousel Viewport */}
      <div
        className="w-full overflow-hidden cursor-grab active:cursor-grabbing"
        ref={emblaRef}
      >
        <div className="flex gap-6 sm:gap-8 px-6 sm:px-12 lg:px-20 py-2">
          {/* SLIDE 1: TESTIMONIALS (LARGE CARD MATCHING REFERENCE SCREENSHOT) */}
          <div className="flex-[0_0_auto] w-[340px] sm:w-[400px] md:w-[450px] lg:w-[480px] h-[480px] sm:h-[510px] md:h-[530px] rounded-3xl border border-border bg-muted/70 p-6 sm:p-7 flex flex-col justify-start overflow-hidden shadow-xs hover:border-primary/40 transition-all select-none">
            <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground text-center mb-6">
              Testimonials
            </h3>

            {/* Tablet Card Mockup with Review */}
            <div className="rounded-2xl bg-accent border border-border p-6 sm:p-7 text-foreground shadow-xl flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Star className="w-4 h-4 fill-primary text-primary" />
                  <span className="font-bold">5.0 Star Rating</span>
                </div>
                <span className="text-[11px] text-muted-foreground">
                  Verified Client
                </span>
              </div>

              <div className="space-y-4 my-auto">
                <div className="space-y-1">
                  <p className="text-base sm:text-lg font-bold text-foreground tracking-tight">
                    Alex Martinez
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                    Director of Sales Operations
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Switching from HubSpot to Salesforce was a gamechanger for us.
                  With SmartRoute, our lead response time dropped by 80% and we
                  saw a 30% jump in conversions in the first month.
                </p>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-center text-[11px] text-muted-foreground">
                <span>Google &amp; Yelp Synced</span>
                <span className="text-foreground font-semibold">
                  100% Verified
                </span>
              </div>
            </div>
          </div>

          {/* SLIDE 2: FAQ (SPIRAL NOTEBOOK GADGET MATCHING REFERENCE SCREENSHOT) */}
          <div className="flex-[0_0_auto] w-[340px] sm:w-[400px] md:w-[450px] lg:w-[480px] h-[480px] sm:h-[510px] md:h-[530px] rounded-3xl border border-border bg-muted/70 p-6 sm:p-7 flex flex-col justify-start overflow-hidden shadow-xs hover:border-primary/40 transition-all select-none">
            <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground text-center mb-6">
              FAQ
            </h3>

            {/* Illustrated Spiral Binder / Notebook Mockup */}
            <div className="rounded-2xl bg-muted/90 border border-input/80 p-3 sm:p-4 flex items-stretch gap-2.5 sm:gap-3 flex-1 shadow-inner overflow-hidden">
              {/* Left Spine / Tablet Bar */}
              <div className="w-12 sm:w-14 rounded-xl bg-surface border border-input/80 p-2 sm:p-2.5 flex flex-col items-center justify-between shrink-0 shadow-2xs">
                <div className="w-5 h-2 rounded-full bg-input" />
                <Grid className="w-4 h-4 text-muted-foreground my-auto" />
                <div className="space-y-2 pb-1">
                  <div className="w-7 h-7 rounded-full bg-surface text-foreground flex items-center justify-center text-[10px] font-bold shadow-xs">
                    &gt;
                  </div>
                  <div className="w-7 h-7 rounded-full bg-muted text-foreground flex items-center justify-center text-xs font-bold shadow-xs">
                    +
                  </div>
                </div>
              </div>

              {/* Spiral Binder Rings */}
              <div className="w-3.5 space-y-4 flex flex-col justify-around py-3 shrink-0">
                <div className="h-3 w-5 -ml-1 rounded-full bg-accent border border-border shadow-sm" />
                <div className="h-3 w-5 -ml-1 rounded-full bg-accent border border-border shadow-sm" />
                <div className="h-3 w-5 -ml-1 rounded-full bg-accent border border-border shadow-sm" />
                <div className="h-3 w-5 -ml-1 rounded-full bg-accent border border-border shadow-sm" />
                <div className="h-3 w-5 -ml-1 rounded-full bg-accent border border-border shadow-sm" />
                <div className="h-3 w-5 -ml-1 rounded-full bg-accent border border-border shadow-sm" />
              </div>

              {/* Right Notebook Page */}
              <div className="flex-1 rounded-2xl bg-surface border-2 border-primary p-4 sm:p-5 flex flex-col justify-between shadow-md">
                <div className="border-b-2 border-primary pb-2 mb-2 flex items-center justify-between">
                  <span className="font-extrabold text-base sm:text-lg text-foreground tracking-tight">
                    FAQs
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-muted text-foreground border border-input">
                    Live Widget
                  </span>
                </div>

                <div className="space-y-3.5 text-xs text-foreground leading-snug my-auto">
                  <div>
                    <p className="font-bold text-foreground text-xs sm:text-sm">
                      1. What is your pricing?
                    </p>
                    <p className="text-muted-foreground text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                      Our plans start at $5 per user and go up to $25 per user
                      for enterprise grade features.
                    </p>
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-xs sm:text-sm">
                      2. How long does implementation take?
                    </p>
                    <p className="text-muted-foreground text-[11px] sm:text-xs mt-0.5 leading-relaxed">
                      Most businesses launch their booking flow in under 15
                      minutes with zero coding.
                    </p>
                  </div>
                </div>

                <div className="text-[10px] text-muted-foreground font-medium pt-2 border-t border-border">
                  Expandable accordion on client checkout
                </div>
              </div>
            </div>
          </div>

          {/* SLIDE 3: FILES (ATTACHMENTS DASHBOARD MATCHING REFERENCE SCREENSHOT) */}
          <div className="flex-[0_0_auto] w-[340px] sm:w-[400px] md:w-[450px] lg:w-[480px] h-[480px] sm:h-[510px] md:h-[530px] rounded-3xl border border-border bg-muted/70 p-6 sm:p-7 flex flex-col justify-start overflow-hidden shadow-xs hover:border-primary/40 transition-all select-none">
            <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground text-center mb-6">
              Files
            </h3>

            {/* Files Dashboard */}
            <div className="rounded-2xl bg-accent border border-border p-5 sm:p-6 text-foreground shadow-xl flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold text-sm text-foreground">
                    Documents &amp; Intake
                  </span>
                </div>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  Auto-sent
                </span>
              </div>

              {/* 2-Column Attachment Previews */}
              <div className="grid grid-cols-2 gap-3 my-auto">
                {/* Folder/Category Card */}
                <div className="rounded-xl bg-surface border border-border p-3.5 flex flex-col justify-between h-40">
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-foreground">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      Documents
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Intake &amp; Waivers
                    </p>
                  </div>
                </div>

                {/* File Attachment: luna2.docx */}
                <div className="rounded-xl bg-surface border border-border p-3.5 flex flex-col justify-between h-40">
                  <div className="h-16 rounded-lg bg-muted/80 border border-border/60 p-2.5 flex flex-col justify-center space-y-1.5">
                    <div className="w-full h-1.5 bg-primary/60 rounded-full" />
                    <div className="w-4/5 h-1.5 bg-primary/60 rounded-full" />
                    <div className="w-1/2 h-1.5 bg-primary/60 rounded-full" />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <span className="px-1.5 py-0.5 rounded bg-muted border border-border text-[9px] font-bold text-muted-foreground">
                      DOC
                    </span>
                    <span className="text-xs font-bold text-foreground truncate">
                      luna2.docx
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-center text-[11px] text-muted-foreground">
                <span>Automatic email &amp; SMS delivery</span>
                <span className="text-foreground font-semibold">
                  1.4 MB Total
                </span>
              </div>
            </div>
          </div>

          {/* SLIDE 4: ABOUT (TABLET BIOGRAPHY MATCHING REFERENCE SCREENSHOT) */}
          <div className="flex-[0_0_auto] w-[340px] sm:w-[400px] md:w-[450px] lg:w-[480px] h-[480px] sm:h-[510px] md:h-[530px] rounded-3xl border border-border bg-muted/70 p-6 sm:p-7 flex flex-col justify-start overflow-hidden shadow-xs hover:border-primary/40 transition-all select-none">
            <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground text-center mb-6">
              About
            </h3>

            {/* Tablet Frame with About Me Pill & Bio */}
            <div className="rounded-2xl bg-accent border border-border p-6 sm:p-7 text-foreground shadow-xl flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <Grid className="w-4 h-4 text-muted-foreground" />
                <div className="px-4 py-1 rounded-full bg-muted border border-border text-xs font-semibold text-foreground">
                  About me
                </div>
                <div className="w-4" />
              </div>

              <div className="my-auto space-y-3">
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed font-normal">
                  Hi! 🏡 I&apos;m Jessica Martinez, a licensed consultant with
                  10+ years of experience in helping clients achieve their
                  goals. Whether you&apos;re a first-time booker or scaling your
                  routine, I provide expert advice and personalized guidance
                  every step of the way.
                </p>
              </div>

              <div className="pt-3 border-t border-border flex justify-between items-center text-[11px] text-muted-foreground">
                <span>1,200+ Sessions Completed</span>
                <span className="text-foreground font-semibold">
                  Verified Pro
                </span>
              </div>
            </div>
          </div>

          {/* SLIDE 5: VIDEOS (VIDEO GREETING CARD) */}
          <div className="flex-[0_0_auto] w-[340px] sm:w-[400px] md:w-[450px] lg:w-[480px] h-[480px] sm:h-[510px] md:h-[530px] rounded-3xl border border-border bg-muted/70 p-6 sm:p-7 flex flex-col justify-start overflow-hidden shadow-xs hover:border-primary/40 transition-all select-none">
            <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground text-center mb-6">
              Videos
            </h3>

            {/* Tablet Frame with Video Player */}
            <div className="rounded-2xl bg-accent border border-border p-6 text-foreground shadow-xl flex-1 flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-border text-[11px] text-muted-foreground">
                <span className="px-2 py-0.5 rounded-full bg-muted border border-border text-[10px] font-semibold text-foreground">
                  Featured Greeting
                </span>
                <span>0:45</span>
              </div>

              <div className="my-auto flex flex-col items-center justify-center space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center shadow-lg hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center text-foreground">
                    <Play className="w-5 h-5 ml-0.5 fill-primary text-primary" />
                  </div>
                </div>
                <div className="text-center space-y-0.5">
                  <p className="text-sm font-bold text-foreground">
                    Elena Rostova • Studio Tour
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Meet your specialist before your session
                  </p>
                </div>
              </div>

              <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary/40 h-full w-1/3 rounded-full" />
              </div>
            </div>
          </div>

          {/* SLIDE 6: CUSTOM DOMAIN & BRANDING */}
          <div className="flex-[0_0_auto] w-[340px] sm:w-[400px] md:w-[450px] lg:w-[480px] h-[480px] sm:h-[510px] md:h-[530px] rounded-3xl border border-border bg-muted/70 p-6 sm:p-7 flex flex-col justify-start overflow-hidden shadow-xs hover:border-primary/40 transition-all select-none">
            <h3 className="text-2xl sm:text-[26px] font-bold tracking-tight text-foreground text-center mb-6">
              Custom Domain
            </h3>

            {/* Browser Address & Color Palette Mockup */}
            <div className="rounded-2xl bg-surface border border-border p-5 text-foreground shadow-xl flex-1 flex flex-col justify-between">
              <div className="p-2.5 rounded-xl border border-border bg-muted text-xs font-mono text-foreground flex items-center justify-between">
                <span className="font-semibold truncate">
                  booking.atelier.com
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-foreground font-bold shrink-0">
                  SSL ✓
                </span>
              </div>

              <div className="space-y-3 my-auto">
                <p className="text-xs font-bold text-foreground">
                  Brand Color Presets
                </p>
                <div className="flex gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-primary border border-primary shadow-xs flex items-center justify-center text-primary-foreground text-xs">
                    <Check className="w-4 h-4" />
                  </span>
                  <span className="w-9 h-9 rounded-xl bg-muted border border-border shadow-xs" />
                  <span className="w-9 h-9 rounded-xl bg-primary/60 border border-input shadow-xs" />
                  <span className="w-9 h-9 rounded-xl bg-primary/40 border border-input shadow-xs" />
                </div>
                <div className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-xs text-center">
                  Custom Styled Checkout
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground text-center pt-2 border-t border-border">
                100% white-label with zero third-party badges
              </div>
            </div>
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
