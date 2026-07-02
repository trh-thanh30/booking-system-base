"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  getStaggerContainer,
  getFadeUp,
  getScaleIn,
} from "../nail-landing-v2.animations";
import { SPECIAL_OFFERS_V2 } from "../nail-landing-v2.constants";

interface OffersV2Props {
  onBook: () => void;
}

// ─── Heading parts ────────────────────────────────────────────────────────
const PART1 = "Experience";
const PART2 = "Luxury Nail"; // accent phrase
const PART3 = "Care Like Never Before";

// Full text (spaces between parts count as positions)
const FULL_TEXT = `${PART1} ${PART2} ${PART3}`;
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
_offset += PART2.length + 1;

const PART3_DELAYS = PART3.split("").map((_, i) => getCharDelay(_offset + i));

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
          <span key={wi} className="inline-block">
            <AnimatedWord word={word} delays={wordDelays} />
            {wi < words.length - 1 && "\u00A0"}
          </span>
        );
      })}
    </>
  );
}

export function OffersV2({ onBook }: OffersV2Props) {
  const prefersReduced = useReducedMotion();
  const containerVariants = getStaggerContainer(prefersReduced, 0.1, 0.05);
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);
  const scaleIn = getScaleIn(prefersReduced, 0.92, 0.65);

  const [seconds, setSeconds] = useState(40);
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const bullets = [
    "Expert-Certified Nail Artists",
    "Premium Nail Products",
    "Long-Lasting Shine",
    "Personalized Care",
  ];

  return (
    <section
      id="special-offers"
      className="py-20 bg-white space-y-24 overflow-hidden"
    >
      {/* 1. Top Section: Experience Luxury */}
      <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Copy */}
        {/* Left Side: Copy */}
        <div className="lg:col-span-6 space-y-6">
          <motion.div
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="space-y-2"
          >
            <motion.span
              variants={fadeUp}
              className="text-xs font-bold text-brand-500 uppercase tracking-wider block"
            >
              Our Nail Experience
            </motion.span>
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
              {"\u00A0"}

              {/* Part 3 – normal */}
              <AnimatedPhrase text={PART3} delays={PART3_DELAYS} />
            </motion.h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="text-stone-600 text-sm sm:text-base leading-relaxed font-normal"
          >
            At Lunaria Nail Studio, every session is designed to make you feel
            confident, elegant, and refreshed. From gentle manicures to
            signature nail art, we blend professional precision with a soothing
            atmosphere. Enjoy personalized designs, long-lasting shine, and
            comfort you&apos;ll fall in love with.
          </motion.p>

          {/* Solid dot bullet lists */}
          <motion.ul
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="space-y-3"
          >
            {bullets.map((bullet, idx) => (
              <li
                key={idx}
                className="flex items-center gap-3 text-sm sm:text-base text-stone-700 font-semibold"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-brand-500 flex-shrink-0" />
                {bullet}
              </li>
            ))}
          </motion.ul>
        </div>

        {/* Right Side: Two Leaf Images side-by-side */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          className="lg:col-span-6 grid grid-cols-2 gap-6"
        >
          <motion.div
            variants={scaleIn}
            className="relative aspect-[3/4] rounded-[80px_0_80px_0] overflow-hidden border border-stone-200 shadow-sm bg-stone-50"
          >
            <Image
              src="/nail-salon/ver3.jpg"
              alt="Nail art service detail 1"
              fill
              className="object-cover"
            />
            <div className="absolute inset-3.5 rounded-[inherit] border border-brand-900/30 pointer-events-none z-10" />
          </motion.div>
          <motion.div
            variants={scaleIn}
            className="relative aspect-[3/4] rounded-[80px_0_80px_0] overflow-hidden border border-stone-200 shadow-sm bg-stone-50"
          >
            <Image
              src="/nail-salon/ver2.jpg"
              alt="Nail art service detail 2"
              fill
              className="object-cover"
            />
            <div className="absolute inset-3.5 rounded-[inherit] border border-brand-900/30 pointer-events-none z-10" />
          </motion.div>
        </motion.div>
      </div>

      {/* 2. Bottom Section: Countdown Promo Card Grid (Image 5) */}
      <div className="max-w-[1200px] mx-auto px-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center"
        >
          {/* Left image column */}
          <motion.div
            variants={scaleIn}
            className="md:col-span-3 hidden md:block"
          >
            <div className="relative aspect-[4/5] rounded-[60px_0_60px_0] overflow-hidden border border-stone-200/60 bg-stone-50">
              <Image
                src="/nail-salon/ver1.jpg"
                alt="Promo side decor left"
                fill
                className="object-cover"
              />
              <div className="absolute inset-3.5 rounded-[inherit] border border-brand-900/30 pointer-events-none z-10" />
            </div>
          </motion.div>

          {/* Center Promo details card */}
          <motion.div
            variants={scaleIn}
            className="relative md:col-span-6 bg-brand-100 border border-stone-200 rounded-[32px] p-8 sm:p-12 text-center shadow-md space-y-6"
          >
            <div className="absolute inset-3 rounded-[inherit] border border-brand-900/30 pointer-events-none" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-500">
              Special Offers
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold font-serif text-brand-900">
              {SPECIAL_OFFERS_V2.title}
            </h3>
            <p className="text-sm sm:text-base text-stone-600 font-normal leading-relaxed max-w-md mx-auto">
              {SPECIAL_OFFERS_V2.subtitle}
            </p>

            {/* Countdown Clock Grid */}
            <div className="grid grid-cols-4 gap-2 sm:gap-4 max-w-sm mx-auto py-2">
              {[
                { label: "Days", val: SPECIAL_OFFERS_V2.countdown.days },
                { label: "Hours", val: SPECIAL_OFFERS_V2.countdown.hours },
                { label: "Minutes", val: SPECIAL_OFFERS_V2.countdown.minutes },
                { label: "Seconds", val: String(seconds).padStart(2, "0") },
              ].map((time, idx) => (
                <div
                  key={idx}
                  className="bg-white/80 backdrop-blur-sm border border-stone-200/50 rounded-2xl p-2.5 sm:p-3 space-y-1"
                >
                  <div className="text-lg sm:text-2xl font-bold font-serif text-brand-900">
                    {time.val}
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-brand-500 font-medium">
                    {time.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={onBook}
                className="px-8 py-3.5 bg-brand-500 hover:bg-stone-900 text-white text-sm font-bold uppercase tracking-wider rounded-full transition-all shadow-md active:scale-98"
              >
                Book Appointment Now
              </button>
            </div>
          </motion.div>

          {/* Right image column */}
          <motion.div
            variants={scaleIn}
            className="md:col-span-3 hidden md:block"
          >
            <div className="relative aspect-[4/5] rounded-[60px_0_60px_0] overflow-hidden border border-stone-200/60 bg-stone-50">
              <Image
                src="/nail-salon/ver3.jpg"
                alt="Promo side decor right"
                fill
                className="object-cover"
              />
              <div className="absolute inset-3.5 rounded-[inherit] border border-brand-900/30 pointer-events-none z-10" />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
export default OffersV2;
