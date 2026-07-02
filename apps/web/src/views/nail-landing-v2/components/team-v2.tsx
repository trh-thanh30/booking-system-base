"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { TEAM_V2 } from "../nail-landing-v2.constants";
import { getStaggerContainer, getFadeUp } from "../nail-landing-v2.animations";

// ─── Heading parts ────────────────────────────────────────────────────────
const PART1 = "The Artists Behind Every";
const PART2 = "Perfect Nail"; // accent phrase

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

export function TeamV2() {
  const prefersReduced = useReducedMotion();

  const containerVariants = getStaggerContainer(prefersReduced, 0.1, 0.05);
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  return (
    <section
      id="team"
      className="py-20 bg-stone-50 border-t border-stone-200 overflow-hidden"
    >
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
              Our Team
            </motion.span>
            <motion.h2
              className="text-3xl sm:text-4xl font-bold font-serif text-brand-900 leading-[1.35] select-none text-center"
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
          </motion.div>

          <motion.p
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, amount: 0.3 }}
            className="text-sm sm:text-base text-stone-500 max-w-lg mx-auto font-light leading-relaxed"
          >
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut et massa
            mi. Aliquam in hendrerit urna.
          </motion.p>
        </div>

        {/* Team Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {TEAM_V2.map((member, index) => {
            return (
              <motion.div
                key={index}
                variants={fadeUp}
                whileHover={prefersReduced ? {} : { y: -6, scale: 1.02 }}
                className="group rounded-[32px] p-6 text-center border border-stone-200/60 bg-brand-100 text-brand-900 hover:bg-brand-500 hover:text-white hover:border-brand-500/20 shadow-sm transition-all duration-300"
              >
                {/* Asymmetric Leaf Corner Image */}
                <div className="relative aspect-[4/5] rounded-[60px_0_60px_0] overflow-hidden bg-stone-100 border border-stone-200 mb-6">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover grayscale-[30%] group-hover:grayscale-0 transition-all duration-500"
                  />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold font-serif transition-colors duration-300">
                    {member.name}
                  </h3>
                  <p className="text-sm font-normal text-stone-500 group-hover:text-white/80 transition-colors duration-300">
                    {member.role}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
export default TeamV2;
