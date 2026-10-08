"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Calendar } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { SERVICES_V2 } from "../constants/nail-landing-v2.constants";
import {
  getStaggerContainer,
  getFadeUp,
  getScaleIn,
} from "../utils/nail-landing-v2.animations";
import type { BookingV2Props } from "../types/nail-landing-v2.types";

// ─── Heading parts ────────────────────────────────────────────────────────
const PART1 = "Book Your";
const PART2 = "Treatment"; // accent phrase

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

export function BookingV2({
  selectedService,
  setSelectedService,
}: BookingV2Props) {
  const t = useTranslations("BusinessSetup.template");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: "",
    time: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const prefersReduced = useReducedMotion();

  const containerVariants = getStaggerContainer(prefersReduced, 0.1, 0.05);
  const fadeUp = getFadeUp(prefersReduced, 20, 0.5);
  const scaleIn = getScaleIn(prefersReduced, 0.95, 0.55);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section
      id="booking"
      className="py-20 bg-white border-t border-neutral-200 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Title */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.3 }}
          variants={containerVariants}
          className="text-center max-w-2xl mx-auto mb-12 space-y-3"
        >
          <motion.span
            variants={fadeUp}
            className="text-xs font-bold tracking-widest text-brand-500 uppercase"
          >
            Appointment
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
          <motion.p
            variants={fadeUp}
            className="text-sm sm:text-base text-neutral-500 max-w-md mx-auto font-light leading-relaxed"
          >
            {t("demoBookingHint")}
          </motion.p>
        </motion.div>

        {/* Booking Card Form Container (Leaf Asymmetric Corner Shape in Cream Bg) */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: false, amount: 0.15 }}
          variants={scaleIn}
          className="max-w-2xl mx-auto bg-brand-100 border border-neutral-200 rounded-[32px_0_32px_0] p-8 sm:p-12 shadow-sm"
        >
          {submitted ? (
            <div className="text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-success-500/10 text-success-500 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[3]" />
              </div>
              <h3 className="text-lg font-bold text-brand-900">
                {t("demoBadge")}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-500 font-light max-w-md mx-auto leading-relaxed">
                {t("demoSubmitted")}
              </p>
              <button
                onClick={() => {
                  setSubmitted(false);
                  setFormData({
                    name: "",
                    email: "",
                    phone: "",
                    date: "",
                    time: "",
                  });
                }}
                className="mt-6 h-10 px-6 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-full uppercase tracking-wider transition-colors"
              >
                Book Another Appointment
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-brand-900"
                  htmlFor="name"
                >
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="e.g. Charlotte Miller"
                  className="w-full h-10 px-4 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
                  style={{ fontFamily: "Arial, sans-serif" }}
                />
              </div>

              {/* Grid Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-brand-900"
                    htmlFor="email"
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="e.g. charlotte@example.com"
                    className="w-full h-10 px-4 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-brand-900"
                    htmlFor="phone"
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="e.g. +44 7946 0000"
                    className="w-full h-10 px-4 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  />
                </div>
              </div>

              {/* Service Select dropdown */}
              <div className="space-y-2">
                <label
                  className="block text-xs font-bold uppercase tracking-wider text-brand-900"
                  htmlFor="service"
                >
                  Select Treatment
                </label>
                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full h-10 px-4 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all appearance-none"
                  style={{ fontFamily: "Arial, sans-serif" }}
                >
                  <option value="">-- Choose a service --</option>
                  {SERVICES_V2.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Date and Time grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-brand-900"
                    htmlFor="date"
                  >
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="w-full h-10 px-4 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    className="block text-xs font-bold uppercase tracking-wider text-brand-900"
                    htmlFor="time"
                  >
                    Preferred Time
                  </label>
                  <input
                    type="time"
                    id="time"
                    required
                    value={formData.time}
                    onChange={(e) =>
                      setFormData({ ...formData, time: e.target.value })
                    }
                    className="w-full h-10 px-4 bg-white border border-neutral-300 rounded-lg text-sm text-neutral-700 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/15 transition-all"
                    style={{ fontFamily: "Arial, sans-serif" }}
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full h-11 bg-brand-500 hover:bg-neutral-900 text-white text-xs sm:text-sm font-bold rounded-full uppercase tracking-wider transition-all inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md active:scale-98"
                >
                  <Calendar className="w-4 h-4" />
                  Confirm Reservation Slot
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
export default BookingV2;
