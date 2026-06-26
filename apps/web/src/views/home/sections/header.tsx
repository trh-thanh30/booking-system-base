"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown, Menu, X, Globe, Check } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useScrollHeader } from "@/src/hooks/useScrollHeader";
import { useActiveSection } from "@/src/hooks/useActiveSection";
import { MotionButton } from "@/src/components/motion/MotionButton";
import { NAV_ITEMS } from "../home.constants";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "vi", label: "Tiếng Việt", flag: "🇻🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文 (简体)", flag: "🇨🇳" },
];

export function Header() {
  const isHeaderScrolled = useScrollHeader(12);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [mobileOpenAccordion, setMobileOpenAccordion] = useState<string | null>(
    null,
  );
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [selectedLang, setSelectedLang] = useState("en");
  const shouldReduceMotion = useReducedMotion();
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeSection = useActiveSection([
    "problems",
    "how-it-works",
    "features",
    "templates",
    "customization",
    "channels",
    "marketplace",
    "industries",
    "early-access",
    "pricing",
    "faq",
  ]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isHeaderScrolled
          ? "border-b border-border-light bg-bg-primary/95 backdrop-blur-md shadow-sm"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-brand-blue rounded-[3px] flex items-center justify-center text-white font-bold text-sm shadow-sm select-none">
            B
          </div>
          <span className="font-bold text-sm tracking-tight text-text-primary">
            Booking<span className="text-brand-blue font-extrabold">Base</span>
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {NAV_ITEMS.map((item, idx) => {
            if (item.type === "link") {
              return (
                <a
                  key={idx}
                  href={item.href}
                  className={`text-sm transition-colors ${
                    activeSection === item.href.slice(1)
                      ? "text-brand-blue font-bold"
                      : "text-text-muted hover:text-text-primary font-medium"
                  }`}
                >
                  {item.label}
                </a>
              );
            }

            return (
              <div
                key={idx}
                className="relative py-2"
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
              >
                <button
                  type="button"
                  className="flex items-center gap-1 text-sm font-medium text-text-muted hover:text-text-primary cursor-pointer transition-colors focus:outline-none"
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                      hoveredNav === item.label ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {hoveredNav === item.label && (
                    <motion.div
                      initial={
                        shouldReduceMotion
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 10, scale: 0.98 }
                      }
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={
                        shouldReduceMotion
                          ? { opacity: 1, y: 0 }
                          : { opacity: 0, y: 10, scale: 0.98 }
                      }
                      transition={{ duration: 0.15, ease: "easeOut" }}
                      className={`absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-white border border-border-light rounded-xl p-3 shadow-xl z-[100] ${
                        item.label === "Industries"
                          ? "w-[360px] sm:w-[420px]"
                          : item.label === "Resources"
                            ? "w-56"
                            : "w-80"
                      }`}
                    >
                      <div
                        className={`grid gap-1 ${item.label === "Industries" ? "grid-cols-2" : "grid-cols-1"}`}
                      >
                        {item.items?.map((sub, sidx) => {
                          const Icon = sub.icon;
                          const subDesc =
                            "description" in sub ? sub.description : undefined;
                          return (
                            <a
                              key={sidx}
                              href={sub.href}
                              className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-bg-secondary transition-colors group"
                            >
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-[#E5F0FF] text-brand-blue group-hover:bg-brand-blue group-hover:text-white transition-colors">
                                <Icon className="w-4 h-4" />
                              </div>
                              <div className="space-y-0.5">
                                <p className="text-xs font-bold text-text-primary group-hover:text-brand-blue transition-colors">
                                  {sub.label}
                                </p>
                                {subDesc && (
                                  <p className="text-[10px] text-text-muted leading-relaxed">
                                    {subDesc}
                                  </p>
                                )}
                              </div>
                            </a>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {/* Compact Language Selector */}
            <div className="relative py-2" ref={langRef}>
              <button
                type="button"
                onClick={() => setIsLangOpen(!isLangOpen)}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-secondary transition-colors cursor-pointer focus:outline-none"
                aria-label="Select Language"
              >
                <Globe className="w-4 h-4" />
              </button>
              <AnimatePresence>
                {isLangOpen && (
                  <motion.div
                    initial={
                      shouldReduceMotion
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 10, scale: 0.98 }
                    }
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={
                      shouldReduceMotion
                        ? { opacity: 1, y: 0 }
                        : { opacity: 0, y: 10, scale: 0.98 }
                    }
                    transition={{ duration: 0.12, ease: "easeOut" }}
                    className="absolute right-0 top-full mt-1 w-44 bg-white border border-border-light rounded-xl p-1.5 shadow-xl z-[100]"
                  >
                    <div className="text-[10px] font-bold text-text-muted uppercase tracking-wider px-2 py-1 border-b border-border-light/40 mb-1">
                      Language
                    </div>
                    <div className="grid gap-0.5">
                      {LANGUAGES.map((lang) => {
                        const isActive = selectedLang === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => {
                              setSelectedLang(lang.code);
                              setIsLangOpen(false);
                            }}
                            className={`w-full flex items-center justify-between rounded-lg px-2 py-1.5 text-left text-xs font-semibold transition-colors hover:bg-bg-secondary cursor-pointer ${
                              isActive
                                ? "bg-brand-blue/5 text-brand-blue"
                                : "text-text-primary"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{lang.flag}</span>
                              <span>{lang.label}</span>
                            </span>
                            {isActive && (
                              <Check className="w-3 h-3 stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <div className="border-t border-border-light/40 mt-1 pt-1.5 px-2 pb-0.5">
                      <a
                        href="#"
                        className="text-[10px] font-bold text-brand-blue hover:underline block"
                      >
                        View all 30+ languages →
                      </a>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-text-secondary hover:text-brand-blue transition-colors cursor-pointer"
            >
              Log In
            </button>
            <MotionButton
              variant="primary"
              className="h-10 px-4 text-xs font-semibold py-2"
              onClick={() => {
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Start free trial
            </MotionButton>
          </div>

          {/* Hamburger button on mobile */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary focus:outline-none cursor-pointer z-50 rounded"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={
          isMobileMenuOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -20 }
        }
        transition={{ duration: 0.2 }}
        className={`absolute inset-x-0 top-16 bg-bg-primary border-b border-border-light shadow-xl z-[60] md:hidden transition-all duration-300 ${
          isMobileMenuOpen
            ? "pointer-events-auto block"
            : "pointer-events-none hidden"
        }`}
      >
        <nav className="flex flex-col p-6 space-y-2">
          {NAV_ITEMS.map((item, idx) => {
            if (item.type === "link") {
              return (
                <a
                  key={idx}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-base font-semibold py-3 border-b border-border-light/40 transition-colors block ${
                    activeSection === item.href.slice(1)
                      ? "text-brand-blue"
                      : "text-text-muted hover:text-text-primary"
                  }`}
                >
                  {item.label}
                </a>
              );
            }

            const isAccordionOpen = mobileOpenAccordion === item.label;

            return (
              <div key={idx} className="border-b border-border-light/40 py-2">
                <button
                  type="button"
                  onClick={() =>
                    setMobileOpenAccordion(isAccordionOpen ? null : item.label)
                  }
                  className="w-full flex items-center justify-between py-2 text-base font-semibold text-text-muted hover:text-text-primary focus:outline-none cursor-pointer"
                >
                  <span>{item.label}</span>
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isAccordionOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isAccordionOpen && (
                    <motion.div
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
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-4 pr-2 space-y-1 mt-1"
                    >
                      {item.items?.map((sub, sidx) => {
                        const SubIcon = sub.icon;
                        const subDesc =
                          "description" in sub ? sub.description : undefined;
                        return (
                          <a
                            key={sidx}
                            href={sub.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                            }}
                            className="flex items-center gap-3 min-h-11 py-2 text-sm text-text-secondary hover:text-brand-blue transition-colors"
                          >
                            <div className="w-7 h-7 rounded-md bg-[#E5F0FF] text-brand-blue flex items-center justify-center flex-shrink-0">
                              <SubIcon className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="font-semibold text-xs text-text-primary">
                                {sub.label}
                              </span>
                              {subDesc && (
                                <span className="text-[10px] text-text-muted leading-tight">
                                  {subDesc}
                                </span>
                              )}
                            </div>
                          </a>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {/* Mobile Language Accordion */}
          <div className="border-b border-border-light/40 py-2">
            <button
              type="button"
              onClick={() =>
                setMobileOpenAccordion(
                  mobileOpenAccordion === "lang" ? null : "lang",
                )
              }
              className="w-full flex items-center justify-between py-2 text-base font-semibold text-text-muted hover:text-text-primary focus:outline-none cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span>
                  Language (
                  {LANGUAGES.find((l) => l.code === selectedLang)?.label})
                </span>
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  mobileOpenAccordion === "lang" ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence initial={false}>
              {mobileOpenAccordion === "lang" && (
                <motion.div
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
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pl-4 pr-2 space-y-1 mt-1"
                >
                  {LANGUAGES.map((lang) => {
                    const isActive = selectedLang === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setSelectedLang(lang.code);
                          setMobileOpenAccordion(null);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between py-2.5 text-sm font-semibold transition-colors hover:text-brand-blue cursor-pointer ${
                          isActive ? "text-brand-blue" : "text-text-secondary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="pt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full py-3 text-center text-sm font-bold text-text-secondary bg-bg-secondary rounded-full active:scale-[0.98] transition-all cursor-pointer min-h-11"
            >
              Log In
            </button>
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                const el = document.getElementById("pricing");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full py-3 text-center text-sm font-bold text-white bg-brand-blue rounded-full active:scale-[0.98] transition-all cursor-pointer min-h-11"
            >
              Start free trial
            </button>
          </div>
        </nav>
      </motion.div>
    </header>
  );
}
