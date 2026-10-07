"use client";

import { useTranslations } from "next-intl";
import { ScrollProgressBar } from "./components/ScrollProgressBar";

import {
  Header,
  Hero,
  PillarsSection,
  IndustrySolutionsSection,
  Features,
  CustomizationSection,
  Pricing,
  FAQ,
  Footer,
} from "./sections";

export function HomeView() {
  const t = useTranslations("Navigation");

  return (
    <div className="landing min-h-dvh bg-background text-foreground overflow-x-clip font-sans relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-surface focus:p-3"
      >
        {t("skip")}
      </a>
      <ScrollProgressBar />

      <Header />
      <main id="main-content" tabIndex={-1}>
        {/* SECTION 1: HERO & INDUSTRY MARQUEE */}
        <Hero />

        {/* SECTION 2: 4 PILLARS & SOCIAL BIO (SQUARE APPOINTMENTS STYLE) */}
        <PillarsSection />

        {/* SECTION 3: INDUSTRY SOLUTIONS (EMBLA SLIDER FOR 5 TRADES) */}
        <IndustrySolutionsSection />

        {/* SECTION 4: DEEP-DIVE FEATURES (COMPREHENSIVE BENTO GRID & CAL STYLE) */}
        <Features />

        {/* SECTION 5: ENDLESS CUSTOMISATION OPTIONS (LUNACAL STYLE) */}
        <CustomizationSection />

        {/* SECTION 6: TRANSPARENT PRICING */}
        <Pricing />

        {/* SECTION 7: FAQ & FOOTER */}
        <FAQ />
        <Footer />
      </main>
    </div>
  );
}
