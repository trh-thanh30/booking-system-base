"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getStaggerContainer, getFadeUp } from "../nail-landing-v2.animations";
import type { HeroV2Props } from "../nail-landing-v2.types";

export function HeroV2({ onBook }: HeroV2Props) {
  const prefersReduced = useReducedMotion();

  const containerVariants = getStaggerContainer(prefersReduced, 0.12, 0.1);
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden bg-brand-500"
    >
      {/* Full-bleed background image with tinsel theme */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/nail-salon/ver1.jpg"
          alt="Luxury Glossora Nail Art background"
          fill
          className="object-cover opacity-60"
        />
        {/* Soft dark-plum gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/60 via-brand-500/50 to-brand-900/80 z-10" />
      </div>

      {/* Content wrapper */}
      <div className="max-w-[1200px] mx-auto px-6 relative z-20 text-center text-white py-16">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8 max-w-3xl mx-auto"
        >
          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase text-brand-100"
          >
            Where Art Meets Elegance
          </motion.p>

          {/* Title */}
          <motion.h1
            variants={fadeUp}
            className="text-4xl sm:text-5xl md:text-7xl font-bold font-serif leading-tight tracking-normal"
          >
            Let Your Nails
            <br />
            Speak Style
          </motion.h1>

          {/* Description spacer */}
          <motion.p
            variants={fadeUp}
            className="text-sm sm:text-base text-white/80 max-w-xl mx-auto font-light leading-relaxed"
          >
            Step into a world of elegance, precision care, and stunning custom
            aesthetics curated for your unique style.
          </motion.p>

          {/* Button: DISCOVER MORE */}
          <motion.div variants={fadeUp} className="pt-4">
            <button
              onClick={onBook}
              className="px-8 py-3.5 bg-brand-100 hover:bg-brand-500 text-brand-500 hover:text-white text-xs font-bold uppercase tracking-wider rounded-full hover:scale-105 transition-all shadow-lg active:scale-98"
            >
              Discover More
            </button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
export default HeroV2;
