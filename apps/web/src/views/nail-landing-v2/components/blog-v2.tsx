"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { BLOGS_V2 } from "../nail-landing-v2.constants";
import { getStaggerContainer, getFadeUp } from "../nail-landing-v2.animations";

// Heading parts
const PART1 = "Nail";
const PART2 = "Care Tips & Trends";

const FULL_TEXT = `${PART1} ${PART2}`;
const CENTER_IDX = (FULL_TEXT.length - 1) / 2;

const BASE_DELAY = 0.05;
const CHAR_STAGGER = 0.038;

function getCharDelay(globalIdx: number): number {
  return BASE_DELAY + Math.abs(globalIdx - CENTER_IDX) * CHAR_STAGGER;
}

let _offset = 0;
const PART1_DELAYS = PART1.split("").map((_, i) => getCharDelay(_offset + i));
_offset += PART1.length + 1;
const PART2_DELAYS = PART2.split("").map((_, i) => getCharDelay(_offset + i));

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

function AnimatedPhrase({ text, delays }: { text: string; delays: number[] }) {
  const words = text.split(" ");
  let charOffset = 0;

  return (
    <>
      {words.map((word, wi) => {
        const wordDelays = delays.slice(charOffset, charOffset + word.length);
        charOffset += word.length + 1;
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

const slideUpCard = {
  hidden: { y: 65, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 90, damping: 15 },
  },
};

export function BlogV2() {
  const prefersReduced = useReducedMotion();

  const containerVariants = getStaggerContainer(prefersReduced, 0.1, 0.05);
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  return (
    <section id="blog" className="py-20 bg-white overflow-hidden">
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
              Our Blog
            </motion.span>
            <motion.h2
              aria-label={`${PART1} ${PART2}`}
              className="text-3xl sm:text-4xl font-bold font-serif text-brand-900 leading-[1.35] select-none text-center"
              initial={prefersReduced ? "show" : "hidden"}
              whileInView="show"
              viewport={{ once: false, amount: 0.3 }}
            >
              <span aria-hidden="true">
                <AnimatedPhrase text={PART1} delays={PART1_DELAYS} />
                {"\u00A0"}
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
            className="text-xs sm:text-sm text-stone-500 max-w-lg mx-auto font-light leading-relaxed"
          >
            Discover the latest secrets of nail care, custom artwork trends, and
            beauty tips from our master artists.
          </motion.p>
        </div>

        {/* 3-Column Blog Cards Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {BLOGS_V2.map((blog, idx) => {
            return (
              <motion.div
                key={idx}
                variants={slideUpCard}
                whileHover={prefersReduced ? {} : { y: -6, scale: 1.01 }}
                className="group rounded-[32px] p-8 border border-stone-200/60 bg-brand-100 text-brand-900 hover:bg-brand-500 hover:text-white hover:border-brand-500/20 transition-all duration-300 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-4">
                  {/* Asymmetric Leaf Corner Image */}
                  <div className="relative aspect-[4/3] rounded-[48px_0_48px_0] overflow-hidden bg-stone-100 border border-stone-200/30 mb-6">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
                    />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif leading-snug transition-colors duration-300">
                    {blog.title}
                  </h3>
                  <p className="text-sm font-normal leading-relaxed text-stone-500 group-hover:text-white/85 transition-colors duration-300">
                    {blog.excerpt}
                  </p>
                </div>

                {/* Read More link */}
                <div className="pt-6 mt-6 border-t border-stone-300/30 group-hover:border-white/20 transition-colors duration-300 flex items-center justify-between">
                  <span className="text-sm font-bold uppercase tracking-wider transition-colors duration-300">
                    Read More
                  </span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center border border-stone-300 bg-white text-brand-500 group-hover:bg-brand-600 group-hover:border-brand-400/25 group-hover:text-white transition-all duration-300 hover:rotate-45">
                    <ArrowUpRight className="w-4 h-4" />
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

export default BlogV2;
