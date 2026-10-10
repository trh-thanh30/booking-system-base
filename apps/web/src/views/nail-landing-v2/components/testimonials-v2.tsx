/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { getFadeUp } from "../nail-landing-v2.animations";

interface TestimonialItem {
  id: number;
  name: string;
  role: string;
  text: string;
  avatar: string;
  rating: number;
}

const COMMENTS_LIST: TestimonialItem[] = [
  {
    id: 1,
    name: "Sarah Mitchell",
    role: "Regular Client",
    avatar: "/nail-salon/ver1.jpg",
    text: "Absolutely love my new gel nails! The attention to detail is outstanding, and the atmosphere was so relaxing. Will definitely be a regular client here.",
    rating: 5,
  },
  {
    id: 2,
    name: "Emily Jakes",
    role: "Artist & Designer",
    avatar: "/nail-salon/ver2.jpg",
    text: "The luxury nail treatment here is unmatched. My nails have never looked so healthy and beautiful. The customized designs are always perfect and unique.",
    rating: 5,
  },
  {
    id: 3,
    name: "Olivia Bennett",
    role: "Vogue UK Contributor",
    avatar: "/nail-salon/ver3.jpg",
    text: "Professional staff, clean environment, and stunning results. The custom design they created for me was perfect. Truly a premium experience.",
    rating: 5,
  },
];

const PART1 = "Nail Stories";
const PART2 = "That Shine";

const BASE_DELAY = 0.05;
const CHAR_STAGGER = 0.038;

const FULL_TEXT = `${PART1} ${PART2}`;
const CENTER_IDX = (FULL_TEXT.length - 1) / 2;

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

export function TestimonialsV2() {
  const prefersReduced = useReducedMotion();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % COMMENTS_LIST.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [resetKey]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % COMMENTS_LIST.length);
    setResetKey((prev) => prev + 1);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + COMMENTS_LIST.length) % COMMENTS_LIST.length,
    );
    setResetKey((prev) => prev + 1);
  };

  const activeTestimonial = COMMENTS_LIST[currentIndex]!;
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  return (
    <section
      id="testimonials"
      className="py-24 bg-stone-50 border-t border-stone-200/60 overflow-hidden select-none"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
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
              Testimonials
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
        </div>

        {/* Editorial Split Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
          {/* Left Column: Styled Oval/Arch Portrait */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Arch/Oval Outer Ring */}
            <div className="absolute -inset-4 border border-brand-200/60 rounded-full pointer-events-none translate-x-3 translate-y-3" />

            {/* Main Portrait Oval */}
            <div className="relative z-10 w-64 h-80 sm:w-72 sm:h-96 rounded-full overflow-hidden border-4 border-white shadow-2xl bg-stone-100">
              <img
                src={activeTestimonial.avatar}
                alt={activeTestimonial.name}
                className="w-full h-full object-cover transition-all duration-700 hover:scale-105"
              />
            </div>

            {/* Circular rating stamp decoration */}
            <div className="absolute bottom-4 right-4 z-20 w-16 h-16 rounded-full bg-brand-500 text-white flex flex-col items-center justify-center border-4 border-white shadow-xl text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                5.0
              </span>
              <span className="text-[7px] uppercase tracking-wider text-brand-100 font-semibold mt-0.5">
                Rating
              </span>
            </div>
          </div>

          {/* Right Column: High-Contrast Testimonial Quote */}
          <div className="lg:col-span-7 space-y-8 relative">
            {/* Gigantic back quote icon watermark */}
            <div className="absolute -top-12 -left-8 text-brand-100/40 -z-10 select-none">
              <Quote className="w-28 h-28 stroke-[0.5]" />
            </div>

            {/* Testimonial text block */}
            <div className="min-h-[160px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial.id}
                  initial={{ opacity: 0, x: prefersReduced ? 0 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: prefersReduced ? 0 : -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6"
                >
                  <p className="text-xl sm:text-2xl md:text-3xl font-serif font-light italic leading-relaxed text-stone-700">
                    &ldquo;{activeTestimonial.text}&rdquo;
                  </p>

                  <div className="space-y-1">
                    <h4 className="text-base sm:text-lg font-serif font-bold text-stone-900">
                      {activeTestimonial.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-brand-600 font-semibold tracking-wider uppercase">
                      {activeTestimonial.role}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Navigation Arrows */}
            <div className="flex gap-3 justify-start pt-4">
              <button
                onClick={handlePrev}
                className="w-12 h-12 rounded-full border border-stone-200 hover:border-brand-500 bg-white hover:bg-stone-50 text-stone-600 hover:text-brand-600 flex items-center justify-center shadow-sm active:scale-95 transition-all"
                aria-label="Previous quote"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-12 h-12 rounded-full border border-stone-200 hover:border-brand-500 bg-white hover:bg-stone-50 text-stone-600 hover:text-brand-600 flex items-center justify-center shadow-sm active:scale-95 transition-all"
                aria-label="Next quote"
              >
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TestimonialsV2;
