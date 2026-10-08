"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";
import { HeaderV2 } from "./components/header-v2";
import { MobileMenuOverlayV2 } from "./components/mobile-menu-overlay-v2";
import { HeroV2 } from "./components/hero-v2";
import { AboutV2 } from "./components/about-v2";
import { ServicesV2 } from "./components/services-v2";
import { OffersV2 } from "./components/offers-v2";
import { TeamV2 } from "./components/team-v2";
import { GalleryV2 } from "./components/gallery-v2";
import { TestimonialsV2 } from "./components/testimonials-v2";
import { BlogV2 } from "./components/blog-v2";
import { FAQV2 } from "./components/faq-v2";
import { BookingV2 } from "./components/booking-v2";
import { FooterV2 } from "./components/footer-v2";
import { ThemeSwitcherV2 } from "./components/theme-switcher-v2";
import { THEME_TEMPLATES_V2 } from "./constants/nail-landing-v2.constants";
import type { ThemeColors } from "./types/nail-landing-v2.types";
import { CustomCursor } from "./components/custom-cursor";

export function NailLandingV2View() {
  const t = useTranslations("BusinessSetup.template");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [activeSection, setActiveSection] = useState("hero");

  // Theme configuration state
  const [themeColors, setThemeColors] = useState<ThemeColors>(
    THEME_TEMPLATES_V2[0]!.colors,
  );
  const [currentThemeId, setCurrentThemeId] = useState<string>(
    THEME_TEMPLATES_V2[0]!.id,
  );

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = [
      "hero",
      "about",
      "services",
      "special-offers",
      "team",
      "gallery",
      "testimonials",
      "blog",
      "faq",
      "booking",
    ];

    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          if (entry && entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: "-25% 0px -55% 0px",
        },
      );
      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  const handleBookClick = () => {
    const el = document.getElementById("booking");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectService = (serviceId: string) => {
    setSelectedService(serviceId);
    handleBookClick();
  };

  return (
    <div className="font-sans text-brand-900 bg-white antialiased min-h-screen lg:cursor-none">
      <CustomCursor />
      <HeaderV2
        scrolled={scrolled}
        onOpenMenu={() => setMobileMenuOpen(true)}
        activeSection={activeSection}
      />
      <MobileMenuOverlayV2
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
      <main>
        <p
          role="note"
          className="relative z-10 bg-brand-100 px-6 pb-3 pt-24 text-center text-sm text-brand-900"
        >
          {t("demoNotice")}
        </p>
        <HeroV2 onBook={handleBookClick} />
        <AboutV2 />
        <ServicesV2 onSelectService={handleSelectService} />
        <OffersV2 onBook={handleBookClick} />
        <TeamV2 />
        <GalleryV2 />
        <TestimonialsV2 />
        <BlogV2 />
        <FAQV2 />
        <BookingV2
          selectedService={selectedService}
          setSelectedService={setSelectedService}
        />
      </main>
      <FooterV2 />
      {/* Scroll to Top Button */}
      <AnimatePresence>
        {scrolled && (
          <motion.button
            key="scroll-to-top"
            initial={{ opacity: 0, scale: 0.6, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6, y: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 22 }}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed right-6 bottom-40 md:bottom-20 z-50 w-12 h-12 rounded-full bg-brand-100 text-brand-500 border border-brand-300/40 flex items-center justify-center shadow-lg shadow-brand-500/10 hover:bg-white hover:scale-105 active:scale-95 transition-all duration-200"
            aria-label="Scroll to top"
            whileHover={{ y: -3 }}
          >
            <ArrowUp className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        )}
      </AnimatePresence>
      <ThemeSwitcherV2
        currentThemeId={currentThemeId}
        themeColors={themeColors}
        onThemeSelect={(id, colors) => {
          setCurrentThemeId(id);
          setThemeColors(colors);
        }}
      />
    </div>
  );
}
export default NailLandingV2View;
