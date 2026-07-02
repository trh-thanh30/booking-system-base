"use client";

import { motion } from "framer-motion";
import { Menu, Sparkles } from "lucide-react";
import type { HeaderV2Props } from "../nail-landing-v2.types";

const navLinks = [
  { id: "hero", label: "Home" },
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "special-offers", label: "Offers" },
  { id: "booking", label: "Contact" },
];

export function HeaderV2({
  scrolled,
  onOpenMenu,
  activeSection,
}: HeaderV2Props) {
  // Helper to map secondary sections to high-level header categories
  const getMappedActiveSection = (section: string): string => {
    if (section === "team") return "about";
    if (section === "gallery") return "special-offers";
    if (
      section === "testimonials" ||
      section === "blog" ||
      section === "faq" ||
      section === "booking"
    ) {
      return "booking";
    }
    return section;
  };

  const mappedActive = getMappedActiveSection(activeSection);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 text-white select-none h-16 transition-all duration-300 ${scrolled ? "bg-brand-500/90 backdrop-blur-md shadow-md border-b border-brand-400/20" : "bg-brand-500"}`}
    >
      <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center justify-between">
        {/* Logo (Icon + Text) */}
        <a
          href="#"
          className="flex items-center gap-2 text-white hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-wider font-serif flex items-center gap-1.5">
              <Sparkles className="w-5 h-5 text-brand-100" />
              Glossora
            </span>
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {navLinks.map((link) => {
            const isActive = mappedActive === link.id;
            return (
              <a
                key={link.id}
                href={`#${link.id}`}
                className={`text-sm font-bold uppercase tracking-wider h-full flex items-center relative transition-colors ${
                  isActive ? "text-brand-100" : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <motion.span
                    layoutId="activeSectionIndicatorV2"
                    className="absolute bottom-0 inset-x-0 h-0.5 bg-brand-100"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Button: Book Now */}
        <div className="hidden md:flex items-center gap-4">
          <a
            href="#booking"
            className="px-7 py-3 bg-brand-100 text-brand-500 text-xs font-bold uppercase tracking-wider rounded-full hover:bg-white hover:scale-105 transition-all shadow-md active:scale-98"
          >
            Book Now
          </a>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          onClick={onOpenMenu}
          className="md:hidden p-1.5 rounded text-white hover:bg-white/10 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
}
export default HeaderV2;
