"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { motion, useReducedMotion, AnimatePresence } from "framer-motion";
import { FAQS_V2 } from "../constants/nail-landing-v2.constants";
import {
  getStaggerContainer,
  getFadeUp,
} from "../utils/nail-landing-v2.animations";

// ─── Heading parts ────────────────────────────────────────────────────────
const PART1 = "Frequently Asked";
const PART2 = "Questions"; // accent phrase

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

interface FAQItemV2 {
  id: number;
  q: string;
  a: string;
}

export function FAQV2() {
  const [openId, setOpenId] = useState<number | null>(null);
  const prefersReduced = useReducedMotion();

  const containerVariants = getStaggerContainer(prefersReduced, 0.08, 0.05);
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  const toggle = (id: number) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section
      id="faq"
      className="py-20 bg-neutral-50 border-t border-neutral-200 overflow-hidden"
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
              Got Questions?
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
            className="text-sm sm:text-base text-neutral-500 max-w-lg mx-auto font-light leading-relaxed"
          >
            Everything you need to know about our luxury nail procedures,
            appointments, and care guarantees.
          </motion.p>
        </div>

        {/* FAQs Accordion */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
          className="max-w-3xl mx-auto space-y-4"
        >
          {FAQS_V2.map((faq: FAQItemV2) => {
            const isOpen = openId === faq.id;
            return (
              <motion.div
                key={faq.id}
                variants={fadeUp}
                className={`border rounded-2xl overflow-hidden shadow-sm transition-all duration-350 ${
                  isOpen
                    ? "bg-brand-100/65 border-brand-500/20"
                    : "bg-white border-neutral-200"
                }`}
              >
                <button
                  onClick={() => toggle(faq.id)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left transition-colors hover:bg-neutral-50/50 select-none"
                >
                  <span
                    className={`text-base font-bold transition-colors ${isOpen ? "text-brand-500" : "text-brand-900"}`}
                  >
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 transition-all duration-350 ${
                      isOpen ? "rotate-180 text-brand-500" : "text-neutral-400"
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        ease: [0.04, 0.62, 0.23, 0.98],
                      }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 border-t border-neutral-200/40 text-sm sm:text-base text-neutral-600 font-normal leading-relaxed">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
export default FAQV2;
