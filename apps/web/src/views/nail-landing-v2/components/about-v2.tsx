"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { getStaggerContainer, getFadeUp } from "../nail-landing-v2.animations";
import { STATS_V2 } from "../nail-landing-v2.constants";

// ─── Heading parts ────────────────────────────────────────────────────────
const PART1 = "Your Journey to Chic Nails";
const PART2 = "& Timeless Beauty"; // accent phrase

// Full text (spaces between parts count as positions)
const FULL_TEXT = `${PART1} ${PART2}`;
const CENTER_IDX = (FULL_TEXT.length - 1) / 2;

const BASE_DELAY = 0.05;
const CHAR_STAGGER = 0.038; // slower spread from center

/** Delay = distance from center of heading */
function getCharDelay(globalIdx: number): number {
  return BASE_DELAY + Math.abs(globalIdx - CENTER_IDX) * CHAR_STAGGER;
}

// Pre-compute delay arrays for each part (before render, stable)
let _offset = 0;
const PART1_DELAYS = PART1.split("").map((_, i) => getCharDelay(_offset + i));
_offset += PART1.length + 1; // +1 for the space between parts

const PART2_DELAYS = PART2.split("").map((_, i) => getCharDelay(_offset + i));

// ─── Char variants (custom = per-char delay) ─────────────────────────────
const charVariants = {
  hidden: { y: "108%", opacity: 0 },
  show: (delay: number) => ({
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.65,
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
      delay,
    },
  }),
};

// ─── AnimatedWord: renders chars with pre-computed delays ─────────────────
function AnimatedWord({ word, delays }: { word: string; delays: number[] }) {
  return (
    <span
      className="inline-block overflow-hidden"
      style={{ verticalAlign: "bottom" }}
    >
      {word.split("").map((char, i) => (
        <motion.span
          key={i}
          className="inline-block"
          variants={charVariants}
          custom={delays[i] ?? 0}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

// ─── AnimatedPhrase: handles multi-word phrases ───────────────────────────
function AnimatedPhrase({ text, delays }: { text: string; delays: number[] }) {
  const words = text.split(" ");
  let charOffset = 0;

  return (
    <>
      {words.map((word, wi) => {
        const wordDelays = delays.slice(charOffset, charOffset + word.length);
        charOffset += word.length + 1; // +1 for the space
        return (
          <span key={wi}>
            <AnimatedWord word={word} delays={wordDelays} />
            {wi < words.length - 1 && "\u00A0"}
          </span>
        );
      })}
    </>
  );
}

// ─── Component ────────────────────────────────────────────────────────────
export function AboutV2() {
  const prefersReduced = useReducedMotion();

  const containerVariants = getStaggerContainer(prefersReduced, 0.1, 0.05);
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  const images: [string, string, string, string] = [
    "/nail-salon/ver1.jpg",
    "/nail-salon/ver2.jpg",
    "/nail-salon/ver3.jpg",
    "/nail-salon/ver2.jpg",
  ];

  // ─── Image Grid 4-Direction Animations ─────────────────────────────
  const img1Variants = {
    hidden: { y: -400, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };
  const img2Variants = {
    hidden: { x: 400, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };
  const img3Variants = {
    hidden: { x: -400, opacity: 0 },
    show: {
      x: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };
  const img4Variants = {
    hidden: { y: 400, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: { type: "spring" as const, stiffness: 100, damping: 20 },
    },
  };

  return (
    <section
      id="about"
      className="lg:h-[calc(100vh-4rem)] min-h-screen flex items-center py-20 lg:py-0 bg-white overflow-hidden scroll-mt-16"
    >
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Column: 4-Image Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
          className="lg:col-span-6 grid grid-cols-2 gap-4"
        >
          {/* 1. Top-Left (slides down) */}
          <motion.div
            variants={img1Variants}
            className="relative aspect-[4/5] rounded-tl-[60px] overflow-hidden border border-stone-200 shadow-sm bg-stone-50"
          >
            <Image
              src={images[0]}
              alt="Nail salon interior 1"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* 2. Top-Right (slides left) */}
          <motion.div
            variants={img2Variants}
            className="relative aspect-[4/5] rounded-tr-[60px] overflow-hidden border border-stone-200 shadow-sm bg-stone-50"
          >
            <Image
              src={images[1]}
              alt="Nail salon interior 2"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* 3. Bottom-Left (slides right) */}
          <motion.div
            variants={img3Variants}
            className="relative aspect-[4/5] rounded-bl-[60px] overflow-hidden border border-stone-200 shadow-sm bg-stone-50"
          >
            <Image
              src={images[2]}
              alt="Nail salon interior 3"
              fill
              className="object-cover"
            />
          </motion.div>

          {/* 4. Bottom-Right (slides up) */}
          <motion.div
            variants={img4Variants}
            className="relative aspect-[4/5] rounded-br-[60px] overflow-hidden border border-stone-200 shadow-sm bg-stone-50"
          >
            <Image
              src={images[3]}
              alt="Nail salon interior 4"
              fill
              className="object-cover"
            />
          </motion.div>
        </motion.div>

        {/* Right Column: Copy & Stats */}
        <div className="lg:col-span-6 space-y-6">
          {/* Eyebrow */}
          <motion.span
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="text-xs font-bold text-brand-500 uppercase tracking-wider block"
          >
            About Us
          </motion.span>

          {/* ── Heading: parent triggers variants, chars animate center-out ── */}
          <motion.h2
            className="text-3xl sm:text-4xl font-bold font-serif text-brand-900 leading-[1.35] select-none"
            initial={prefersReduced ? "show" : "hidden"}
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
          >
            {/* Part 1 – normal */}
            <AnimatedPhrase text={PART1} delays={PART1_DELAYS} />
            {"\u00A0"}

            {/* Part 2 – accent */}
            <span className="inline-block text-brand-500">
              <AnimatedPhrase text={PART2} delays={PART2_DELAYS} />
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal"
          >
            Pamper yourself with stunning nail designs and luxurious salon
            treatments crafted to perfection. Our expert nail artists ensure
            every detail shines — from elegant manicures to dazzling nail art,
            bringing confidence at your fingertips.
          </motion.p>

          {/* Stats Box */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="bg-brand-500 text-white p-6 rounded-[20px] shadow-md grid grid-cols-3 text-center divide-x divide-white/20"
          >
            {STATS_V2.map((stat, idx) => (
              <div key={idx} className="space-y-1">
                <p className="text-xl sm:text-2xl font-bold font-serif">
                  {stat.value}
                </p>
                <p className="text-[10px] sm:text-xs text-white/80 font-light uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Buttons */}
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.12,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="flex flex-wrap items-center gap-4 pt-2"
          >
            <motion.a
              href="#booking"
              variants={{
                hidden: { x: prefersReduced ? 0 : 80, opacity: 0 },
                show: {
                  x: 0,
                  opacity: 1,
                  transition: {
                    type: "tween",
                    ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
                    duration: 0.85,
                  },
                },
              }}
              className="px-8 py-3.5 border border-brand-500 bg-brand-500 text-white hover:bg-white hover:text-brand-500 text-sm font-bold uppercase tracking-wider rounded-full shadow-sm hover:shadow transition-all"
            >
              Meet Our Experts
            </motion.a>
            <motion.a
              href="#gallery"
              variants={{
                hidden: { x: prefersReduced ? 0 : 80, opacity: 0 },
                show: {
                  x: 0,
                  opacity: 1,
                  transition: {
                    type: "tween",
                    ease: [0.25, 1, 0.5, 1] as [number, number, number, number],
                    duration: 0.85,
                  },
                },
              }}
              className="px-8 py-3.5 bg-white text-brand-500 hover:bg-brand-500 hover:text-white text-sm font-bold uppercase tracking-wider rounded-full border border-brand-500 transition-all"
            >
              Discover Our Story
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
export default AboutV2;
