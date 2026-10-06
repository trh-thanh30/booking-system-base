"use client";

import { useState, useEffect, useRef } from "react";
import { ArrowRight, Calendar, Check } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import {
  LandingSection,
  LandingContainer,
} from "@/src/components/common/landing-compositions";

import { formatDemoPrice } from "../../utils/demo-currency.utils";

import { CARDS_DATA } from "./data/pillars.data";

export function PillarsSection() {
  const locale = useLocale();
  const price = (amount: number) => formatDemoPrice(amount, locale);
  const subtotal = 65 + 32;
  const tax = subtotal * 0.08;
  const t = useTranslations("landing_page_home.pillars");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeCardId) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        activeCardRef.current &&
        !activeCardRef.current.contains(event.target as Node)
      ) {
        setActiveCardId(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveCardId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeCardId]);

  return (
    <LandingSection
      id="pillars"
      className="scroll-mt-24 py-24 lg:py-32 bg-surface text-foreground font-sans overflow-hidden"
    >
      <LandingContainer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-5xl mx-auto space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.14] text-balance">
            {t.rich("title", {
              br: () => <br />,
              highlight: (chunks) => (
                <span className="text-muted-foreground font-bold">
                  {chunks}
                </span>
              ),
            })}
          </h2>

          <p className="mt-5 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* 2x2 Square Appointments Style Grid (Fixed height, absolute layers to prevent any layout shift) */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {CARDS_DATA.map((card) => {
            const isFlipped = activeCardId === card.id;
            const isDimmed = activeCardId !== null && !isFlipped;

            return (
              <div
                key={card.id}
                ref={isFlipped ? activeCardRef : undefined}
                onClick={() => {
                  if (!isFlipped) {
                    setActiveCardId(card.id);
                  }
                }}
                className={`relative h-[660px] sm:h-[700px] rounded-3xl border border-border bg-surface shadow-xs hover:border-primary/40 transition-all duration-500 ease-in-out overflow-hidden ${
                  isDimmed
                    ? "opacity-30 hover:opacity-60 cursor-pointer"
                    : "opacity-100"
                }`}
              >
                {/* LAYER 1: MOCKUP & OVERVIEW (Default View) */}
                <div
                  className={`absolute inset-0 pt-10 sm:pt-14 px-4 sm:px-8 lg:px-12 flex flex-col justify-between text-center transition-opacity duration-500 ease-in-out overflow-hidden ${
                    isFlipped
                      ? "opacity-0 pointer-events-none"
                      : "opacity-100 pointer-events-auto"
                  }`}
                >
                  <div className="space-y-3.5 max-w-lg mx-auto">
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      {t(`cards.${card.id}.title`)}
                    </h3>
                    <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                      {t(`cards.${card.id}.description`)}
                    </p>
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCardId(card.id);
                        }}
                        className="inline-flex items-center gap-1.5 text-sm sm:text-base font-bold text-primary hover:underline cursor-pointer"
                      >
                        <span>{t("seeFeatures")}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Device Mockups pinned to bottom */}
                  <div className="mt-auto overflow-hidden">
                    {card.id === "scheduling" && (
                      <div className="mx-auto w-full max-w-[420px] sm:max-w-[450px] rounded-t-3xl border-t-4 border-x-4 border-input bg-foreground p-2.5 pb-0 shadow-lg">
                        <div className="rounded-t-2xl bg-surface border-t border-x border-border p-4 pb-8 text-left space-y-3.5">
                          <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold px-1">
                            <span>9:41</span>
                            <div className="w-20 h-3 rounded-full bg-foreground mx-auto" />
                            <span>5G</span>
                          </div>

                          <div className="flex items-center justify-between border-b border-border pb-2.5">
                            <span className="text-sm font-bold text-foreground">
                              {t("demo.november2026")}
                            </span>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-muted">
                                {t("demo.day")}
                              </span>
                              <span className="text-xs px-2 py-0.5 text-muted-foreground">
                                {t("demo.week")}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 gap-1.5 text-center text-xs">
                            {Array.from({ length: 7 }, (_, i) =>
                              t(`demo.weekdays.d${i}`),
                            ).map((d, i) => (
                              <div
                                key={i}
                                className={`py-1.5 rounded-lg ${
                                  i === 3
                                    ? "bg-primary text-primary-foreground font-bold"
                                    : "text-muted-foreground"
                                }`}
                              >
                                <span className="block opacity-60 text-[10px]">
                                  {d}
                                </span>
                                <span className="block font-semibold mt-0.5">
                                  {4 + i}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-2 pt-1 text-xs">
                            <div className="p-3 rounded-xl bg-primary text-primary-foreground space-y-1">
                              <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 font-bold text-xs">
                                <span>09:30 AM – 10:30 AM</span>
                                <span>{price(85.0)}</span>
                              </div>
                              <p className="font-bold text-sm">
                                {t("demo.names.christina")}
                              </p>
                              <p className="text-xs text-primary-foreground/85">
                                {t("demo.shortHair")}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-muted border border-border/80 text-foreground space-y-1">
                              <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 font-semibold text-xs text-muted-foreground">
                                <span>11:00 AM – 12:00 PM</span>
                                <span className="font-bold text-foreground">
                                  {price(65.0)}
                                </span>
                              </div>
                              <p className="font-bold text-sm">
                                {t("demo.names.derrick")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("demo.facial")}
                              </p>
                            </div>

                            <div className="p-3 rounded-xl bg-surface border border-border text-foreground space-y-1 opacity-80">
                              <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 font-medium text-xs text-muted-foreground">
                                <span>02:00 PM – 02:45 PM</span>
                                <span className="font-semibold text-foreground">
                                  {price(45.0)}
                                </span>
                              </div>
                              <p className="font-bold text-sm">
                                {t("demo.names.cliff")}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("demo.beard")}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.id === "pos" && (
                      <div className="@container mx-auto w-full max-w-[520px] sm:max-w-[550px] rounded-t-3xl border-t-4 border-x-4 border-input bg-foreground p-2.5 pb-0 shadow-lg">
                        <div className="rounded-t-2xl bg-surface border-t border-x border-border p-3 @min-[400px]:p-4 pb-8 text-left grid grid-cols-1 @min-[400px]:grid-cols-12 gap-3 text-xs">
                          <div className="min-w-0 @min-[400px]:col-span-7 space-y-2.5 border-b @min-[400px]:border-b-0 @min-[400px]:border-r border-border pb-3 @min-[400px]:pb-0 @min-[400px]:pr-3">
                            <div className="flex items-center justify-between text-xs font-bold text-foreground pb-1.5 border-b border-border">
                              <span>{t("demo.quickServices")}</span>
                              <span className="text-[11px] text-muted-foreground">
                                {t("demo.favorites")}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              {[
                                { id: "hairCut", price: 45 },
                                { id: "facialCare", price: 85 },
                                { id: "manicure", price: 32 },
                                { id: "blowdry", price: 28 },
                                { id: "hotStone", price: 65 },
                                { id: "lookbook", price: 120 },
                              ].map((srv, idx) => (
                                <div
                                  key={idx}
                                  className={`min-w-0 p-2 rounded-xl border border-border bg-muted/70 hover:border-primary/40 cursor-pointer space-y-1 ${idx >= 4 ? "hidden @min-[400px]:block" : ""}`}
                                >
                                  <p className="text-xs font-semibold text-foreground leading-snug min-h-8 @min-[400px]:min-h-0">
                                    {t(`demo.services.${srv.id}`)}
                                  </p>
                                  <p className="text-xs font-bold text-foreground whitespace-nowrap">
                                    {price(srv.price)}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="min-w-0 @min-[400px]:col-span-5 space-y-2.5 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between pb-1.5 border-b border-border text-xs">
                                <span className="font-bold text-foreground">
                                  {t("demo.currentSale")}
                                </span>
                                <span className="text-muted-foreground">
                                  {t("demo.names.lauren")}
                                </span>
                              </div>

                              <div className="space-y-1.5 text-xs">
                                <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-foreground">
                                  <span>{t("demo.hairCutStyle")}</span>
                                  <span className="font-semibold whitespace-nowrap">
                                    {price(65.0)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-foreground">
                                  <span>{t("demo.manicureSet")}</span>
                                  <span className="font-semibold whitespace-nowrap">
                                    {price(32.0)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap justify-between gap-x-2 gap-y-1 text-muted-foreground pt-1.5 border-t border-border">
                                  <span>{t("demo.tax")}</span>
                                  <span className="whitespace-nowrap">
                                    {price(tax)}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-3">
                              <button
                                type="button"
                                className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs font-bold text-center cursor-pointer shadow-xs hover:bg-primary-hover transition-colors"
                              >
                                {t("demo.charge", {
                                  amount: price(subtotal + tax),
                                })}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.id === "people" && (
                      <div className="@container mx-auto w-full max-w-[520px] sm:max-w-[550px] rounded-t-3xl border-t-4 border-x-4 border-input bg-foreground p-2.5 pb-0 shadow-lg">
                        <div className="rounded-t-2xl bg-surface border-t border-x border-border p-3 @min-[400px]:p-4 pb-8 text-left grid grid-cols-1 @min-[400px]:grid-cols-12 gap-3 text-xs">
                          <div className="min-w-0 @min-[400px]:col-span-6 space-y-2 @min-[400px]:border-r border-border @min-[400px]:pr-3">
                            <div className="flex items-center justify-between pb-1.5 border-b border-border text-xs">
                              <span className="font-bold text-foreground">
                                {t("demo.clientsStaff")}
                              </span>
                              <span className="text-muted-foreground">
                                {t("demo.totalClients", { count: 142 })}
                              </span>
                            </div>

                            <div className="space-y-1.5">
                              {[
                                {
                                  name: t("demo.names.elisa"),
                                  vip: true,
                                },
                                {
                                  name: t("demo.names.emi"),
                                  vip: false,
                                },
                                {
                                  name: t("demo.names.cameron"),
                                  vip: true,
                                },
                                {
                                  name: t("demo.names.natalia"),
                                  vip: false,
                                },
                              ].map((c, i) => (
                                <div
                                  key={i}
                                  className={`p-2 rounded-xl ${i === 0 ? "flex" : "hidden @min-[400px]:flex"} items-center justify-between gap-2 text-xs ${
                                    i === 0
                                      ? "bg-primary text-primary-foreground font-semibold"
                                      : "bg-muted/70 border border-border/80 text-foreground"
                                  }`}
                                >
                                  <div className="min-w-0 flex items-center gap-2">
                                    <span
                                      className={`w-5 h-5 shrink-0 rounded-full flex items-center justify-center text-[9px] font-bold ${
                                        i === 0
                                          ? "bg-surface text-foreground"
                                          : "bg-muted text-foreground"
                                      }`}
                                    >
                                      {c.name.charAt(0)}
                                    </span>
                                    <span className="truncate">{c.name}</span>
                                  </div>
                                  {c.vip && (
                                    <span
                                      className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                        i === 0
                                          ? "bg-primary-hover text-primary-foreground"
                                          : "bg-muted text-foreground"
                                      }`}
                                    >
                                      VIP
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="min-w-0 @min-[400px]:col-span-6 space-y-2.5 text-xs">
                            <div className="pb-1.5 border-b border-border">
                              <p className="hidden @min-[400px]:block font-bold text-foreground text-sm">
                                {t("demo.names.elisa")}
                              </p>
                              <p className="text-muted-foreground text-[10px]">
                                {t("demo.clientSince")}
                              </p>
                            </div>

                            <div className="space-y-1 bg-muted p-2.5 rounded-xl border border-border/80">
                              <span className="font-bold text-foreground text-[10px] uppercase tracking-wider block">
                                {t("demo.preferences")}
                              </span>
                              <p className="text-muted-foreground leading-relaxed text-xs @min-[400px]:text-[11px]">
                                {t("demo.allergy")}
                              </p>
                              <p className="text-muted-foreground leading-relaxed text-xs @min-[400px]:text-[11px]">
                                {t("demo.cardEnding")}
                              </p>
                              <p className="text-muted-foreground leading-relaxed text-xs @min-[400px]:text-[11px]">
                                {t("demo.attendance")}
                              </p>
                            </div>

                            <div className="flex flex-wrap justify-between items-center gap-1 pt-1 text-[11px]">
                              <span className="text-muted-foreground">
                                {t("demo.lifetimeSpend")}
                              </span>
                              <span className="font-extrabold text-foreground text-sm whitespace-nowrap">
                                {price(1420.0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {card.id === "business" && (
                      <div className="mx-auto w-full max-w-[420px] sm:max-w-[450px] rounded-t-3xl border-t-4 border-x-4 border-input bg-foreground p-2.5 pb-0 shadow-lg">
                        <div className="rounded-t-2xl bg-surface border-t border-x border-border p-4 pb-8 text-left space-y-3">
                          <div className="flex items-center justify-between border-b border-border pb-2.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs flex items-center justify-center">
                                L
                              </div>
                              <span className="text-sm font-bold text-foreground">
                                lumiere_beauty
                              </span>
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground">
                              {t("demo.following")}
                            </span>
                          </div>

                          <div className="rounded-2xl border border-border bg-muted p-3 space-y-2.5">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-bold text-foreground">
                                {t("demo.hydration")}
                              </span>
                              <span className="font-extrabold text-foreground text-sm">
                                {price(85.0)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug">
                              {t("demo.hydrationDescription")}
                            </p>

                            <div className="pt-1.5">
                              <button
                                type="button"
                                className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{t("demo.bookWebsite")}</span>
                              </button>
                            </div>
                          </div>

                          <div className="p-2.5 rounded-xl bg-muted border border-border/80 flex items-center justify-between text-xs text-foreground">
                            <span className="font-mono truncate">
                              bookingbase.com/lumiere
                            </span>
                            <span className="font-semibold text-foreground shrink-0 ml-2">
                              {t("demo.shareLink")}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* LAYER 2: FULL FEATURES CHECKLIST (Active View) */}
                <div
                  className={`absolute inset-0 p-10 sm:p-14 flex flex-col justify-between text-left bg-surface transition-opacity duration-500 ease-in-out ${
                    isFlipped
                      ? "opacity-100 pointer-events-auto"
                      : "opacity-0 pointer-events-none"
                  }`}
                >
                  <div className="space-y-8">
                    <h3 className="text-3xl sm:text-4xl font-extrabold text-foreground tracking-tight">
                      {t(`cards.${card.id}.title`)}
                    </h3>

                    <div className="space-y-4 pt-2">
                      {Array.from({ length: card.featureCount }, (_, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-start gap-3.5 text-sm sm:text-base text-foreground leading-snug font-medium"
                        >
                          <Check className="w-5 h-5 text-foreground shrink-0 mt-0.5" />
                          <span>{t(`cards.${card.id}.features.f${fIdx}`)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Horizontal Feature Card: Social Bio Booking (Square Style Banner) */}
        <div className="mt-12 lg:mt-16 rounded-3xl border border-input bg-surface shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left Column: Interactive Social Bio Mockup with Popup */}
          <div className="md:col-span-6 bg-muted/70 p-8 sm:p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-border/80 overflow-hidden relative">
            <div className="w-full max-w-[360px] sm:max-w-[390px] rounded-3xl border-4 border-input bg-surface shadow-lg overflow-hidden text-left relative">
              {/* Phone Header / Status Bar */}
              <div className="bg-surface px-5 pt-3 pb-2.5 border-b border-border flex items-center justify-between text-xs text-muted-foreground font-semibold">
                <span>9:41</span>
                <div className="w-20 h-3 rounded-full bg-foreground" />
                <span>5G</span>
              </div>

              {/* Instagram / Social Profile Header */}
              <div className="p-4 sm:p-5 space-y-3.5">
                <div className="flex items-center gap-3.5">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full border-2 border-primary p-0.5 flex items-center justify-center">
                      <div className="w-full h-full rounded-full bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center">
                        LM
                      </div>
                    </div>
                  </div>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-foreground">
                        lumiere.studio
                      </span>
                      <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[9px] font-bold flex items-center justify-center">
                        ✓
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("demo.atelier")}
                    </p>
                  </div>
                </div>

                <div className="text-xs sm:text-sm text-foreground leading-snug">
                  {t("demo.socialBioLine1")}
                  <br />
                  {t("demo.socialBioLine2")}
                </div>

                {/* Bio Action Link Button */}
                <div className="p-2.5 rounded-xl bg-muted border border-border flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-muted-foreground text-xs">🔗</span>
                    <span className="font-semibold text-foreground truncate">
                      bookingbase.com/lumiere
                    </span>
                  </div>
                  <span className="text-xs font-bold text-foreground bg-surface px-2.5 py-1 rounded-lg shadow-xs shrink-0">
                    {t("demo.bookNow")}
                  </span>
                </div>
              </div>

              {/* Sliding Bottom Sheet Booking Popup (In-App Booking Experience) */}
              <div className="rounded-t-3xl border-t-2 border-input bg-accent text-accent-foreground p-4 sm:p-5 space-y-3 shadow-lg">
                <div className="w-10 h-1 rounded-full bg-input mx-auto" />
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-muted-foreground">
                    {t("demo.instantInApp")}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                    {t("demo.checkout")}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-border space-y-1">
                  <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
                    <span>{t("demo.balayage")}</span>
                    <span>{price(140.0)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("demo.tomorrow")}
                  </p>
                </div>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-xl bg-primary text-primary-foreground text-xs sm:text-sm font-bold text-center cursor-pointer shadow-xs hover:bg-primary-hover transition-colors"
                >
                  {t("demo.confirm")}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Copy & Actions */}
          <div className="md:col-span-6 p-8 sm:p-12 lg:p-16 flex flex-col justify-center text-left space-y-5">
            <div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-primary text-primary-foreground">
                {t("growth.badge")}
              </span>
            </div>

            <h3 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-foreground tracking-tight leading-tight">
              {t("growth.title")}
            </h3>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
              {t("growth.description")}
            </p>

            <div className="pt-2">
              <a
                href="#demo"
                className="inline-flex items-center gap-2 text-sm sm:text-base font-bold text-foreground hover:underline cursor-pointer"
              >
                <span>{t("growth.learnMore")}</span>
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Switching From Another System Callout Banner */}
        <div className="mt-16 rounded-3xl border border-border bg-muted/80 p-8 sm:p-10 lg:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-2">
            <p className="text-xl sm:text-2xl font-extrabold text-foreground">
              {t("migration.title")}
            </p>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl leading-relaxed">
              {t("migration.description")}
            </p>
          </div>

          <a
            href="#faq"
            className="shrink-0 px-8 py-3.5 rounded-full border border-input bg-surface hover:bg-muted text-sm sm:text-base font-bold text-foreground transition-all inline-flex items-center gap-2.5 cursor-pointer shadow-xs"
          >
            <span>{t("migration.cta")}</span>
            <ArrowRight className="w-4 h-4 text-foreground" />
          </a>
        </div>
      </LandingContainer>
    </LandingSection>
  );
}
