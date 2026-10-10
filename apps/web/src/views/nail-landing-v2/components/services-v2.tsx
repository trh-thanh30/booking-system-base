"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import type { ServicesV2Props } from "../types/nail-landing-v2.types";
import { ArrowRight, Clock } from "lucide-react";
import { getFadeUp } from "../utils/nail-landing-v2.animations";

interface ServiceCategory {
  id: string;
  name: string;
  description: string;
  items: {
    id: string;
    name: string;
    price: string;
    duration: string;
    description: string;
  }[];
}

const CATEGORIES_DATA: ServiceCategory[] = [
  {
    id: "classics",
    name: "Classic Nails",
    description:
      "Essential treatments for natural nail beauty and maintenance.",
    items: [
      {
        id: "manicure",
        name: "Classic Manicure",
        price: "£28",
        duration: "30 mins",
        description:
          "Essential nail shaping, cuticle grooming, and light hand massage with premium organic polish.",
      },
      {
        id: "pedicure",
        name: "Classic Pedicure",
        price: "£38",
        duration: "45 mins",
        description:
          "Warm foot soak, sea salt exfoliation, cuticle care, sole smoothing, and massage.",
      },
      {
        id: "gel-polish",
        name: "Gel Polish Overlay",
        price: "£42",
        duration: "40 mins",
        description:
          "Long-lasting premium gel color applied to natural nails. Guaranteed chip-free for up to 4 weeks.",
      },
    ],
  },
  {
    id: "extensions",
    name: "Extensions & Art",
    description:
      "Sculpted length and custom-tailored creative hand-painted aesthetics.",
    items: [
      {
        id: "gel-x",
        name: "Aprés Gel-X Extensions",
        price: "£65",
        duration: "60 mins",
        description:
          "High-grade full-coverage soft gel extensions for a feather-light feel and natural look.",
      },
      {
        id: "acrylics",
        name: "Sculpted Acrylics Full Set",
        price: "£75",
        duration: "75 mins",
        description:
          "Premium durable acrylic extensions sculpted directly on the nail by senior artists.",
      },
      {
        id: "nail-art",
        name: "Bespoke Custom Nail Art",
        price: "£55",
        duration: "50 mins",
        description:
          "Bespoke custom painting, chrome finishes, foils, or gems tailored exactly to your vision.",
      },
    ],
  },
  {
    id: "therapy",
    name: "Spa & Therapy",
    description:
      "Indulgent skin restoration treatments using premium organic oils.",
    items: [
      {
        id: "paraffin",
        name: "Paraffin Hydration therapy",
        price: "£20",
        duration: "20 mins",
        description:
          "Deep nourishing warm paraffin wax wrap to soften, hydrate, and soothe tired hand joints.",
      },
      {
        id: "milk-bath",
        name: "Organic Milk & Rose Spa Bath",
        price: "£35",
        duration: "30 mins",
        description:
          "Luxury warm hand soak in organic honey milk, followed by a warm stone oil massage.",
      },
      {
        id: "cuticle-rest",
        name: "Cuticle Intensive Repair",
        price: "£15",
        duration: "15 mins",
        description:
          "Targeted conditioning treatment using vitamin E and jojoba oils to restore dry, cracked cuticles.",
      },
    ],
  },
];

const PART1 = "Quick Book Your";
const PART2 = "Service";

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

export function ServicesV2({ onSelectService }: ServicesV2Props) {
  const prefersReduced = useReducedMotion();
  const [activeTab, setActiveTab] = useState("classics");

  const currentCategory =
    CATEGORIES_DATA.find((cat) => cat.id === activeTab) || CATEGORIES_DATA[0]!;

  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);

  return (
    <section
      id="services"
      className="py-24 bg-neutral-50/30 border-y border-neutral-200/60 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Header */}
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
              Nail Rituals & Care
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
            className="text-sm sm:text-base text-neutral-500 max-w-lg mx-auto font-light leading-relaxed"
          >
            Choose from our curated collection of luxury nail art and
            therapeutic skincare rituals.
          </motion.p>
        </div>

        {/* Tabbed Menu Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Category Tabs & Description */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex lg:flex-col flex-row overflow-x-auto lg:overflow-visible gap-6 pb-2 lg:pb-0 scrollbar-none lg:border-r border-neutral-200/80 pr-0 lg:pr-8 mb-4 lg:mb-0">
              {CATEGORIES_DATA.map((cat) => {
                const isActive = cat.id === activeTab;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`flex-shrink-0 text-left pb-2 lg:pb-0 lg:py-2.5 transition-all duration-300 text-xs sm:text-sm font-bold uppercase tracking-widest border-b-2 lg:border-b-0 lg:border-l-2 ${
                      isActive
                        ? "text-brand-900 border-brand-500 lg:pl-4"
                        : "text-neutral-450 hover:text-neutral-700 border-transparent lg:pl-4"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>

            {/* Mobile Category Intro */}
            <div className="lg:hidden px-2 mb-4">
              <p className="text-xs italic font-serif text-brand-900/80 leading-relaxed">
                &ldquo;{currentCategory.description}&rdquo;
              </p>
            </div>

            {/* Desktop Category Intro */}
            <div className="bg-brand-50/30 p-6 rounded-2xl border border-brand-100/50 hidden lg:block">
              <p className="text-sm italic font-serif text-brand-900 leading-relaxed">
                &ldquo;{currentCategory.description}&rdquo;
              </p>
            </div>
          </div>

          {/* Right Column: Interactive Line Menu */}
          <div className="lg:col-span-8">
            <div className="bg-white border border-neutral-200/60 rounded-3xl p-6 sm:p-10 shadow-lg relative min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: prefersReduced ? 0 : 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: prefersReduced ? 0 : -15 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="space-y-8"
                >
                  {currentCategory.items.map((item) => (
                    <motion.div
                      key={item.id}
                      className="group block space-y-2 cursor-pointer pb-6 border-b border-neutral-100 last:border-b-0 last:pb-0"
                      onClick={() => onSelectService(item.id)}
                      whileHover={{ x: prefersReduced ? 0 : 6 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                      }}
                    >
                      {/* Name - Line - Price Row */}
                      <div className="flex items-baseline justify-between gap-4">
                        <h4 className="text-base sm:text-lg font-serif font-semibold text-brand-900 group-hover:text-brand-650 transition-colors flex items-center gap-2">
                          {item.name}
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity text-brand-500">
                            ✦
                          </span>
                        </h4>

                        {/* Dot leader */}
                        <div className="flex-grow border-b border-dotted border-neutral-300/60 mx-2 relative -top-1" />

                        <span className="text-base sm:text-lg font-bold font-serif text-brand-600">
                          {item.price}
                        </span>
                      </div>

                      {/* Details Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-xl">
                          {item.description}
                        </p>

                        <div className="flex items-center gap-4 flex-shrink-0">
                          <span className="inline-flex items-center gap-1 text-[10px] text-neutral-400 font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            {item.duration}
                          </span>

                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-50 hover:bg-brand-500 text-brand-600 hover:text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors duration-200">
                            Book
                            <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ServicesV2;
