"use client";

import { Play, Check } from "lucide-react";
import { useTranslations } from "next-intl";
import { MotionButton } from "@/src/components/motion/MotionButton";
import {
  LandingSection,
  LandingContainer,
} from "@/src/components/common/landing-compositions";
import { TEMPLATES_SHOWCASE } from "./data/hero.data";
import { TemplateCard } from "./components/TemplateCard";

function getSignupPath() {
  const locale = window.location.pathname.split("/").filter(Boolean)[0] || "vi";
  return `/${locale}/signup-business`;
}

export function HeroSection() {
  const t = useTranslations("landing_page_home.hero");
  const handleLiveDemo = () => {
    const el =
      document.getElementById("pillars") ||
      document.getElementById("how-it-works");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <LandingSection className="relative pt-20 pb-24 lg:pt-32 lg:pb-36 bg-surface bg-gradient-to-br from-accent from-50% to-surface text-foreground overflow-hidden font-sans">
      {/* Subtle Light Ambient Wash */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-accent rounded-full blur-[120px] pointer-events-none" />

      {/* Blueprint Technical Grid Background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:36px_36px] opacity-40" />

      <LandingContainer className="relative z-10 flex flex-col items-center text-center">
        {/* 1. Giant Centered Headline in Crisp Slate */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-[1.1] max-w-5xl mx-auto text-balance">
          {t.rich("title", {
            br: () => <br className="hidden sm:inline" />,
            highlight: (chunks) => (
              <span className="bg-gradient-to-r from-primary via-primary-hover to-primary-active bg-clip-text text-transparent">
                {chunks}
              </span>
            ),
          })}
        </h1>

        {/* 2. Centered Subtitle */}
        <p className="mt-6 text-base sm:text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
          {t("description")}
        </p>

        {/* 3. Action CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
          <MotionButton
            variant="primary"
            className="w-full sm:w-auto h-13 px-9 text-base font-semibold rounded-full shadow-sm cursor-pointer"
            onClick={() => window.location.assign(getSignupPath())}
          >
            {t("startTrial")}
          </MotionButton>
          <MotionButton
            variant="secondary"
            className="w-full sm:w-auto h-13 px-9 text-base font-semibold rounded-full border border-input bg-surface text-foreground hover:bg-muted hover:border-primary/40 cursor-pointer shadow-xs inline-flex items-center justify-center gap-2"
            onClick={handleLiveDemo}
          >
            <span>{t("liveDemo")}</span>
            <Play className="w-4 h-4 text-foreground" />
          </MotionButton>
        </div>

        {/* 4. Trust Badges */}
        <div className="mt-8 grid grid-cols-1 gap-4 text-left md:flex md:items-center md:justify-center md:gap-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-primary" />
            <span>{t("trust.noCard")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-primary" />
            <span>{t("trust.quickSetup")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-primary" />
            <span>{t("trust.calendarSync")}</span>
          </div>
        </div>
      </LandingContainer>

      {/* 5. Infinite Seamless Scrolling Industry Templates Marquee */}
      <div className="mt-14 sm:mt-18 w-full overflow-hidden relative">
        {/* Left & Right Gradient Fade Masks */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-20 bg-gradient-to-r from-accent to-transparent" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-20 bg-gradient-to-l from-surface to-transparent" />

        <style>{`
          @keyframes infiniteHeroMarquee {
            0% { transform: translateX(0); }
            100% { transform: translateX(-100%); }
          }
          .hero-marquee-track {
            display: flex;
            width: max-content;
            animation: infiniteHeroMarquee 38s linear infinite;
          }
          .hero-marquee-container:hover .hero-marquee-track {
            animation-play-state: paused;
          }
        `}</style>

        {/* Dual tracks for 100% seamless infinite scroll without jerk */}
        <div className="hero-marquee-container flex overflow-hidden">
          <div className="hero-marquee-track flex gap-6 pr-6">
            {TEMPLATES_SHOWCASE.map((tmpl) => (
              <TemplateCard key={tmpl.id} tmpl={tmpl} />
            ))}
          </div>
          <div
            className="hero-marquee-track flex gap-6 pr-6"
            aria-hidden="true"
          >
            {TEMPLATES_SHOWCASE.map((tmpl) => (
              <TemplateCard key={`${tmpl.id}-dup`} tmpl={tmpl} />
            ))}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
