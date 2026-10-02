"use client";

import { useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { useTranslations } from "next-intl";

import {
  Header,
  Hero,
  Problem,
  HowItWorks,
  Features,
  NoShowSection,
  Templates,
  Customization,
  Channels,
  Marketplace,
  Industries,
  EarlyAccess,
  Pricing,
  FAQ,
  FinalCTA,
} from "./sections";

export function HomeView() {
  const t = useTranslations("Navigation");
  // Shared state passed to child sections
  const [activeTemplateIdx, setActiveTemplateIdx] = useState<number>(0);
  const [customColor, setCustomColor] = useState<string>("brand-blue");
  const [customRequireDeposit, setCustomRequireDeposit] =
    useState<boolean>(true);
  const [customSMS, setCustomSMS] = useState<boolean>(true);
  const [customStaff, setCustomStaff] = useState<boolean>(true);
  const [customBusinessName, setCustomBusinessName] =
    useState<string>("Lumière");
  const [customSelectedStaff, setCustomSelectedStaff] =
    useState<string>("emily");

  // Scroll progress bar
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="landing min-h-dvh bg-background text-foreground overflow-x-clip font-sans relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface focus:p-3"
      >
        {t("skip")}
      </a>
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-[0%] z-[100]"
        style={{ scaleX }}
      />

      <Header />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <NoShowSection />

        <Templates
          activeTemplateIdx={activeTemplateIdx}
          setActiveTemplateIdx={setActiveTemplateIdx}
        />

        <Customization
          customColor={customColor}
          setCustomColor={setCustomColor}
          customRequireDeposit={customRequireDeposit}
          setCustomRequireDeposit={setCustomRequireDeposit}
          customSMS={customSMS}
          setCustomSMS={setCustomSMS}
          customStaff={customStaff}
          setCustomStaff={setCustomStaff}
          customBusinessName={customBusinessName}
          setCustomBusinessName={setCustomBusinessName}
          customSelectedStaff={customSelectedStaff}
          setCustomSelectedStaff={setCustomSelectedStaff}
        />

        <Channels
          customColor={customColor}
          customBusinessName={customBusinessName}
          setCustomBusinessName={setCustomBusinessName}
        />

        <Marketplace
          activeTemplateIdx={activeTemplateIdx}
          setActiveTemplateIdx={setActiveTemplateIdx}
          customBusinessName={customBusinessName}
        />

        <Industries
          activeTemplateIdx={activeTemplateIdx}
          setActiveTemplateIdx={setActiveTemplateIdx}
        />
        <EarlyAccess />
        <Pricing />
        <FAQ />
        <FinalCTA />
      </main>
    </div>
  );
}
