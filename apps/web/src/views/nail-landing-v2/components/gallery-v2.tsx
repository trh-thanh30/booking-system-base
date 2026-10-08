"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { GALLERY_V2 } from "../constants/nail-landing-v2.constants";
import {
  getStaggerContainer,
  getFadeUp,
} from "../utils/nail-landing-v2.animations";

// ─── Heading parts ────────────────────────────────────────────────────────
const PART1 = "Beauty at";
const PART2 = "Your Fingertips"; // accent phrase

// Full text (spaces between parts count as positions)
const FULL_TEXT = `${PART1} ${PART2}`;
const CENTER_IDX = (FULL_TEXT.length - 1) / 2;

const BASE_DELAY = 0.05;
const CHAR_STAGGER = 0.038;

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
          <span key={wi} className="inline-block">
            <AnimatedWord word={word} delays={wordDelays} />
            {wi < words.length - 1 && "\u00A0"}
          </span>
        );
      })}
    </>
  );
}

export function GalleryV2() {
  const prefersReduced = useReducedMotion();

  const containerVariants = getStaggerContainer(prefersReduced, 0.08, 0.04);
  const fadeUp = getFadeUp(prefersReduced, 25, 0.5);

  return (
    <section id="gallery" className="py-20 bg-white overflow-hidden">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
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
              className="text-xs font-bold tracking-widest text-brand-500 uppercase block"
            >
              Our Gallery
            </motion.span>
            <motion.h2
              aria-label={`${PART1} ${PART2}`}
              className="text-3xl sm:text-4xl font-bold font-serif text-brand-900 leading-[1.35] select-none text-center"
              initial={prefersReduced ? "show" : "hidden"}
              whileInView="show"
              viewport={{ once: false, amount: 0.3 }}
            >
              <span aria-hidden="true">
                {/* Part 1 – normal */}
                <AnimatedPhrase text={PART1} delays={PART1_DELAYS} />
                {"\u00A0"}

                {/* Part 2 – accent */}
                <span className="inline-block text-brand-500">
                  <AnimatedPhrase text={PART2} delays={PART2_DELAYS} />
                </span>
              </span>
            </motion.h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="text-xs sm:text-sm text-neutral-500 max-w-lg mx-auto font-light leading-relaxed"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa
            mi. Aliquam in hendrerit urna.
          </motion.p>
        </div>

        {/* 6-Image Asymmetric Gallery Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
          className="grid grid-cols-2 md:grid-cols-3 gap-6"
        >
          {GALLERY_V2.map((item, index) => {
            // Alternating asymmetric leaf-corners: odd are top-left & bottom-right, even are top-right & bottom-left
            const isEven = index % 2 === 0;
            const borderShape = isEven
              ? "rounded-[48px_0_48px_0]"
              : "rounded-[0_48px_0_48px]";
            return (
              <motion.div
                key={item.id}
                variants={fadeUp}
                whileHover={prefersReduced ? {} : { scale: 1.02, y: -4 }}
                className={`group relative aspect-[4/5] overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-sm cursor-pointer ${borderShape}`}
              >
                <Image
                  src={item.url}
                  alt={`Nail creation ${item.id}`}
                  fill
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-108"
                />
                {/* Hover overlay with light cream gradient */}
                <div className="absolute inset-0 bg-brand-100/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm border border-neutral-200/40 text-brand-900 text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-full shadow-sm">
                    View Project
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
export default GalleryV2;
