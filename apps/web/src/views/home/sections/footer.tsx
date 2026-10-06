"use client";

import { Link } from "@/src/i18n/navigation";
import { useReducedMotion } from "framer-motion";
import { Linkedin, Twitter, Youtube, Github } from "lucide-react";
import { Typewriter, Cursor } from "react-simple-typewriter";
import { LanguageSwitcher } from "@/src/components/common/language-switcher";
import { useTranslations } from "next-intl";

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
        <span className="text-[clamp(3.5rem,14vw,11.5rem)] font-black tracking-tighter text-foreground/[0.06] leading-none uppercase inline-flex items-center">
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
  const t = useTranslations("landing_page_home.footer");
  return (
    <footer className="w-full bg-surface pt-20 sm:pt-28 pb-16 sm:pb-20 text-muted-foreground select-none overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-10 lg:gap-14 pb-16 sm:pb-20 border-b border-border/80">
          {/* Brand Column - spans 2 columns */}
          <div className="col-span-2 md:col-span-2 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center font-black text-2xl shadow-sm">
                B
              </div>
              <span className="font-black text-2xl sm:text-3xl tracking-tight text-foreground">
                Booking
                <span className="text-muted-foreground font-extrabold">
                  Base
                </span>
              </span>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed font-normal max-w-sm">
              {t("description")}
            </p>
            <div className="flex gap-3 pt-1">
              <a
                href="#"
                aria-label={t("social.linkedin")}
                className="w-11 h-11 rounded-2xl border border-input hover:border-primary bg-surface hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-foreground transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label={t("social.x")}
                className="w-11 h-11 rounded-2xl border border-input hover:border-primary bg-surface hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-foreground transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label={t("social.youtube")}
                className="w-11 h-11 rounded-2xl border border-input hover:border-primary bg-surface hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-foreground transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Youtube className="w-5 h-5" />
              </a>
              <a
                href="#"
                aria-label={t("social.github")}
                className="w-11 h-11 rounded-2xl border border-input hover:border-primary bg-surface hover:bg-primary hover:text-primary-foreground flex items-center justify-center text-foreground transition-all duration-200 cursor-pointer shadow-xs"
              >
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest mb-5">
              {t("columns.product.title")}
            </h4>
            <ul className="space-y-3.5 sm:space-y-4 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.product.features")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.product.pricing")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.product.templates")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.product.integrations")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.product.changelog")}
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest mb-5">
              {t("columns.company.title")}
            </h4>
            <ul className="space-y-3.5 sm:space-y-4 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.company.about")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.company.blog")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.company.careers")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.company.pressKit")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.company.contactSales")}
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest mb-5">
              {t("columns.resources.title")}
            </h4>
            <ul className="space-y-3.5 sm:space-y-4 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.resources.help")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.resources.docs")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.resources.api")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.resources.community")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.resources.status")}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h4 className="text-xs sm:text-sm font-black text-foreground uppercase tracking-widest mb-5">
              {t("columns.legal.title")}
            </h4>
            <ul className="space-y-3.5 sm:space-y-4 font-medium">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.legal.privacy")}
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.legal.terms")}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.legal.cookies")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.legal.gdpr")}
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm sm:text-base font-medium inline-block"
                >
                  {t("columns.legal.dpa")}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Utility Bar: Copyright and Language */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 sm:py-8 border-b border-border/80 gap-4 text-sm font-medium">
          <p className="text-muted-foreground">{t("copyright")}</p>
          <LanguageSwitcher variant="landing" />
        </div>

        {/* Grand Brand Watermark at the Very Bottom (Studio Style) */}
        <TypewriterWatermark />
      </div>
    </footer>
  );
}
