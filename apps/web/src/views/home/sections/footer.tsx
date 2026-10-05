"use client";

import { Link } from "@/src/i18n/navigation";
import { useReducedMotion } from "framer-motion";
import { Linkedin, Twitter, Youtube, Github } from "lucide-react";
import { Typewriter, Cursor } from "react-simple-typewriter";
import { LanguageSwitcher } from "@/src/components/common/language-switcher";

function TypewriterWatermark() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="pt-14 sm:pt-20 pb-6 sm:pb-8 text-center select-none overflow-hidden relative">
      {/* Phantom text for 0-CLS layout stability */}
      <span
        className="invisible select-none pointer-events-none text-[clamp(3.5rem,14vw,11.5rem)] font-black tracking-tighter leading-none block uppercase"
        aria-hidden="true"
      >
        BOOKINGBASE
      </span>

      {/* Visible animated typewriter watermark via react-simple-typewriter */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-[clamp(3.5rem,14vw,11.5rem)] font-black tracking-tighter text-neutral-950/[0.06] leading-none uppercase inline-flex items-center">
          {shouldReduceMotion ? (
            <span>BOOKINGBASE</span>
          ) : (
            <>
              <Typewriter
                words={["BOOKINGBASE"]}
                loop={0}
                cursor={false}
                typeSpeed={130}
                deleteSpeed={70}
                delaySpeed={2200}
              />
              <Cursor
                cursorStyle="|"
                cursorBlinking
                cursorColor="currentColor"
              />
            </>
          )}
        </span>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full bg-surface border-t border-neutral-200/90 pt-20 sm:pt-28 pb-16 sm:pb-20 text-neutral-600 select-none overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 lg:gap-14 pb-16 sm:pb-20 border-b border-neutral-200/80">
          {/* Brand Column - spans 2 columns */}
          <div className="col-span-2 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-neutral-950 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                B
              </div>
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-neutral-950">
                Booking
                <span className="text-neutral-500 font-extrabold">Base</span>
              </span>
            </div>
            <p className="text-base sm:text-lg text-neutral-500 leading-relaxed font-normal max-w-sm">
              The high-performance booking platform and scheduling engine for
              modern service businesses.
            </p>
            <div className="flex gap-3 pt-1">
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-11 h-11 rounded-2xl border border-neutral-300 hover:border-neutral-950 bg-surface hover:bg-neutral-950 hover:text-white flex items-center justify-center text-neutral-700 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="X"
                className="w-11 h-11 rounded-2xl border border-neutral-300 hover:border-neutral-950 bg-surface hover:bg-neutral-950 hover:text-white flex items-center justify-center text-neutral-700 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-11 h-11 rounded-2xl border border-neutral-300 hover:border-neutral-950 bg-surface hover:bg-neutral-950 hover:text-white flex items-center justify-center text-neutral-700 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="w-11 h-11 rounded-2xl border border-neutral-300 hover:border-neutral-950 bg-surface hover:bg-neutral-950 hover:text-white flex items-center justify-center text-neutral-700 transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-widest mb-5">
              Product
            </h4>
            <ul className="space-y-3.5 sm:space-y-4 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Templates
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-widest mb-5">
              Company
            </h4>
            <ul className="space-y-3.5 sm:space-y-4 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Press kit
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Contact sales
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-widest mb-5">
              Resources
            </h4>
            <ul className="space-y-3.5 sm:space-y-4 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Help center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  API reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-neutral-950 uppercase tracking-widest mb-5">
              Legal
            </h4>
            <ul className="space-y-3.5 sm:space-y-4 font-medium">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Terms of service
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  Cookie policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  GDPR
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-neutral-950 transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  DPA
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Utility Bar: Copyright and Language */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 sm:py-8 border-b border-neutral-200/80 gap-4 text-sm font-medium">
          <p className="text-neutral-500">
            © 2026 BookingBase Ltd. All rights reserved.
          </p>
          <LanguageSwitcher variant="landing" />
        </div>

        {/* Grand Brand Watermark at the Very Bottom (Studio Style) */}
        <TypewriterWatermark />
      </div>
    </footer>
  );
}
