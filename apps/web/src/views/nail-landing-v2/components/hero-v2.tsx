"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getStaggerContainer, getFadeUp } from "../nail-landing-v2.animations";
import type { HeroV2Props } from "../nail-landing-v2.types";

interface HeroSlide {
  id: number;
  bgImage: string;
  subheading: string;
  titleText: string;
  description: string;
  btnText: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    bgImage: "/nail-salon/ver1.jpg",
    subheading: "Crafted for Confidence",
    titleText: "Make Every Detail Shine",
    description:
      "Step into a world of elegance, precision care, and stunning custom aesthetics curated for your unique style.",
    btnText: "Book Your Style",
  },
  {
    id: 2,
    bgImage: "/nail-salon/ver2.jpg",
    subheading: "Where Art Meets Elegance",
    titleText: "Let Your Nails Speak Style",
    description:
      "Experience premium organic finishes and bespoke custom art hand-painted by certified senior designers.",
    btnText: "Discover More",
  },
];

export function HeroV2({ onBook }: HeroV2Props) {
  const prefersReduced = useReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);

  // Auto-advance banner slides every 7 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  const containerVariants = getStaggerContainer(prefersReduced, 0.12, 0.1);
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  const activeSlide = HERO_SLIDES[slideIndex]!;

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-brand-900"
    >
      {/* Background Slideshow Image with overlay */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={slideIndex}
            initial={{ opacity: 0, scale: prefersReduced ? 1 : 1.05 }}
            animate={{ opacity: 0.65, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 w-full h-full"
          >
            <Image
              src={activeSlide.bgImage}
              alt={activeSlide.titleText}
              fill
              priority
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>

        {/* Soft dark-plum gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/60 via-brand-900/40 to-brand-900/80 z-10" />
      </div>

      {/* Content wrapper */}
      <div className="max-w-[1200px] mx-auto px-6 relative z-20 text-center text-white py-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={slideIndex}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            className="space-y-8 max-w-3xl mx-auto"
          >
            {/* Subheading */}
            <motion.p
              variants={fadeUp}
              className="text-xs sm:text-sm font-bold tracking-[0.3em] uppercase text-brand-100/90"
            >
              {activeSlide.subheading}
            </motion.p>

            {/* Title */}
            <motion.h1
              variants={fadeUp}
              className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif leading-[1.15] tracking-tight"
            >
              {activeSlide.titleText.split(" ").slice(0, 3).join(" ")}
              <br />
              {activeSlide.titleText.split(" ").slice(3).join(" ")}
            </motion.h1>

            {/* Description spacer */}
            <motion.p
              variants={fadeUp}
              className="text-sm sm:text-base text-white/85 max-w-xl mx-auto font-light leading-relaxed"
            >
              {activeSlide.description}
            </motion.p>

            {/* Button: BOOK YOUR STYLE */}
            <motion.div variants={fadeUp} className="pt-4">
              <button
                onClick={onBook}
                className="px-8 py-4 bg-[#EFE3D3] hover:bg-brand-500 text-brand-500 hover:text-white text-xs font-bold uppercase tracking-wider rounded-full hover:scale-105 active:scale-98 transition-all duration-300 shadow-lg shadow-black/10"
              >
                {activeSlide.btnText}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom slide selector dots */}
      <div className="absolute bottom-8 inset-x-0 z-20 flex justify-center gap-3">
        {HERO_SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setSlideIndex(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              idx === slideIndex
                ? "bg-[#EFE3D3] scale-125"
                : "bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default HeroV2;
