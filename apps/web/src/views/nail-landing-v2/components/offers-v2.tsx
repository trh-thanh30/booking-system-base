/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import type { OffersV2Props } from "../nail-landing-v2.types";
import { Calendar, Percent } from "lucide-react";

export function OffersV2({ onBook }: OffersV2Props) {
  const prefersReduced = useReducedMotion();
  const [seconds, setSeconds] = useState(45);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => (prev > 0 ? prev - 1 : 59));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      id="special-offers"
      className="py-24 bg-brand-900 text-white overflow-hidden relative select-none"
    >
      {/* Decorative luxury vector lines */}
      <div className="absolute inset-0 opacity-5 pointer-events-none -z-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="90%"
            cy="10%"
            r="300"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
          <circle
            cx="10%"
            cy="90%"
            r="400"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
          />
        </svg>
      </div>

      <div className="max-w-[1200px] mx-auto px-6 w-full relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        {/* Left Column: Lookbook editorial copy */}
        <div className="lg:col-span-6 space-y-8 text-left">
          <div className="space-y-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-800 text-brand-300 text-[10px] font-bold tracking-[0.2em] uppercase border border-brand-700/60">
              <Percent className="w-3.5 h-3.5" />
              Limited Lookbook Offer
            </span>

            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light font-serif tracking-tight text-brand-100 leading-tight">
              Indulge in <br />
              <span className="italic font-normal text-brand-300">
                Pure Opulence
              </span>
            </h2>
          </div>

          <p className="text-sm sm:text-base text-brand-100/70 font-light leading-relaxed max-w-md">
            Take a moment to escape into elegance. Enjoy a complete premium gel
            shellac manicure & bespoke nail art combination at 25% off for this
            season only. Perfected with our organic hydration therapies.
          </p>

          {/* Minimalist Champagne Countdown Clock */}
          <div className="flex gap-8 pt-4">
            {[
              { label: "Days", val: "03" },
              { label: "Hours", val: "18" },
              { label: "Min", val: "42" },
              { label: "Sec", val: String(seconds).padStart(2, "0") },
            ].map((time, idx) => (
              <div
                key={idx}
                className="border-b border-brand-800 pb-2 flex flex-col items-start min-w-[60px]"
              >
                <span className="text-3xl font-light font-serif text-brand-100">
                  {time.val}
                </span>
                <span className="text-[9px] uppercase tracking-widest text-brand-400 font-semibold mt-1">
                  {time.label}
                </span>
              </div>
            ))}
          </div>

          {/* Action Button */}
          <div className="pt-6">
            <button
              onClick={onBook}
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-100 hover:bg-white text-brand-900 text-xs font-bold uppercase tracking-wider rounded-full hover:scale-105 active:scale-98 transition-all duration-300 shadow-xl shadow-black/20"
            >
              <Calendar className="w-4 h-4" />
              Claim Invitation
            </button>
          </div>
        </div>

        {/* Right Column: Editorial Arch Image Collage */}
        <div className="lg:col-span-6 relative flex justify-center lg:justify-end">
          {/* Outer Ring decoration */}
          <div className="absolute -inset-4 border border-brand-800/40 rounded-t-[200px] pointer-events-none translate-x-4 translate-y-4" />

          {/* Arch frame Lookbook image */}
          <div className="relative z-10 w-72 h-[420px] sm:w-80 sm:h-[460px] md:w-88 md:h-[500px] rounded-t-[200px] overflow-hidden border-8 border-brand-800 shadow-2xl bg-brand-800/20">
            <img
              src="/nail-salon/ver3.jpg"
              alt="Luxury Nail Treatment Lookbook Model"
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
            />
          </div>

          {/* Floating Vintage Stamp (Top Right) */}
          <motion.div
            className="absolute -top-4 -right-4 md:-right-8 z-20 w-24 h-24 rounded-full bg-brand-500 text-white flex items-center justify-center border-4 border-brand-900 shadow-2xl text-center p-3"
            animate={prefersReduced ? {} : { rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            <span className="text-[8px] font-bold uppercase tracking-widest leading-tight">
              Glossora Couture • Luxury Care •
            </span>
          </motion.div>

          {/* Floating detail tag (Bottom Left) */}
          <motion.div
            className="absolute -bottom-6 -left-6 z-20 bg-brand-800/90 backdrop-blur-md px-5 py-4 rounded-2xl border border-brand-700/60 shadow-xl flex items-center gap-3"
            animate={prefersReduced ? {} : { y: [0, -6, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="w-2.5 h-2.5 rounded-full bg-brand-300 animate-ping" />
            <div>
              <p className="text-[9px] uppercase tracking-wider text-brand-300 font-semibold">
                Special Pricing
              </p>
              <p className="text-xs font-bold text-white mt-0.5">
                Now £48{" "}
                <span className="line-through text-white/40 font-normal ml-1">
                  £65
                </span>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default OffersV2;
