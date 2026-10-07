"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@repo/ui";

import { Fragment, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Lock, X } from "lucide-react";
import { useToast } from "@repo/hooks";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { RepeatStaggerReveal } from "@/src/components/motion/RepeatStaggerReveal";
import { RepeatStaggerItem } from "@/src/components/motion/RepeatStaggerItem";
import { PricingCard } from "@/src/components/common/landing-compositions";
import { useLocale, useTranslations } from "next-intl";
import { getLocaleCurrency } from "../utils/demo-currency.utils";

interface ComparisonRow {
  name: string;
  desc?: string;
  starter: string | boolean;
  professional: string | boolean;
  business: string | boolean;
}

interface ComparisonGroup {
  group: string;
  rows: ComparisonRow[];
}

const PLAN_PRICES = {
  USD: {
    monthly: { starter: 19, professional: 49, business: 99 },
    annual: { starter: 15, professional: 39, business: 79 },
    savings: { starter: 48, professional: 120, business: 240 },
    symbol: "$",
    pos: "prefix" as const,
  },
  EUR: {
    monthly: { starter: 18, professional: 46, business: 92 },
    annual: { starter: 14, professional: 36, business: 74 },
    savings: { starter: 48, professional: 120, business: 216 },
    symbol: "€",
    pos: "prefix" as const,
  },
  VND: {
    monthly: { starter: 480000, professional: 1200000, business: 2500000 },
    annual: { starter: 380000, professional: 950000, business: 1950000 },
    savings: { starter: 1200000, professional: 3000000, business: 6600000 },
    symbol: "₫",
    pos: "suffix" as const,
  },
};

const PLANS = [
  {
    id: "starter" as const,
    name: "Starter",
    description:
      "For solo providers and small teams launching their first booking site.",
    everything_in: null,
    features: [
      {
        group: "Core platform",
        items: [
          "1 location",
          "Up to 3 staff",
          "Unlimited services",
          "Branded booking page",
        ],
      },
      { group: "Communication", items: ["Email notifications"] },
      { group: "Insights", items: ["Basic analytics"] },
    ],
    cta: "Start free trial →",
    popular: false,
  },
  {
    id: "professional" as const,
    name: "Professional",
    description:
      "For growing service teams that need deposits, reminders and CRM.",
    everything_in: "Starter",
    features: [
      {
        group: "Core platform",
        items: [
          "2 locations / branches",
          "Up to 15 staff members",
          "Custom domain support",
        ],
      },
      { group: "Payments & bookings", items: ["Online payments & deposits"] },
      {
        group: "Communication",
        items: ["SMS & email reminders", "Customer CRM & history"],
      },
      { group: "Insights", items: ["Advanced revenue reports"] },
    ],
    cta: "Try Professional free →",
    popular: true,
  },
  {
    id: "business" as const,
    name: "Business",
    description:
      "For multi-location teams that need advanced control and support.",
    everything_in: "Professional",
    features: [
      {
        group: "Core platform",
        items: ["Unlimited locations", "Unlimited staff members"],
      },
      {
        group: "Customization",
        items: [
          "Advanced localization",
          "API & webhooks access",
          "Custom styling",
        ],
      },
      {
        group: "Enterprise support",
        items: [
          "Priority 24/7 support",
          "Dedicated manager",
          "99.9% uptime SLA",
        ],
      },
    ],
    cta: "Talk to sales →",
    popular: false,
  },
];

const COMPARISONS: ComparisonGroup[] = [
  {
    group: "Core platform",
    rows: [
      {
        name: "Locations",
        desc: "Number of physical service locations",
        starter: "1",
        professional: "2 branches",
        business: "Unlimited",
      },
      {
        name: "Staff members",
        desc: "Service providers you can add",
        starter: "Up to 3",
        professional: "Up to 15",
        business: "Unlimited",
      },
      {
        name: "Services",
        desc: "Service listings on your booking page",
        starter: "Unlimited",
        professional: "Unlimited",
        business: "Unlimited",
      },
      {
        name: "Booking page",
        desc: "Customer-facing experience",
        starter: "Branded template",
        professional: "Custom domain",
        business: "Fully custom",
      },
    ],
  },
  {
    group: "Payments & checkout",
    rows: [
      {
        name: "Online payments",
        desc: "Accept card payments on booking",
        starter: false,
        professional: true,
        business: true,
      },
      {
        name: "Deposits & prepay",
        desc: "Collect partial payment upfront",
        starter: false,
        professional: true,
        business: true,
      },
      {
        name: "Tips, upsells, packages",
        desc: "Advanced checkout flows",
        starter: false,
        professional: false,
        business: true,
      },
    ],
  },
  {
    group: "Communication",
    rows: [
      {
        name: "Email notifications",
        desc: "Confirmations, reminders to customers",
        starter: true,
        professional: true,
        business: true,
      },
      {
        name: "SMS reminders",
        desc: "Reduce no-shows with text alerts",
        starter: false,
        professional: true,
        business: true,
      },
      {
        name: "Customer CRM",
        desc: "Notes, history, contact profiles",
        starter: false,
        professional: true,
        business: true,
      },
      {
        name: "Marketing automations",
        desc: "Drip campaigns, re-engagement",
        starter: false,
        professional: false,
        business: true,
      },
    ],
  },
  {
    group: "Insights & support",
    rows: [
      {
        name: "Analytics",
        desc: "Bookings, revenue, customer metrics",
        starter: "Basic",
        professional: "Advanced",
        business: "Custom dashboards",
      },
      {
        name: "Revenue reports",
        desc: "Export-ready financial breakdowns",
        starter: false,
        professional: true,
        business: true,
      },
      {
        name: "API & webhooks",
        desc: "Build custom integrations",
        starter: false,
        professional: false,
        business: true,
      },
      {
        name: "Support level",
        desc: "How fast we respond",
        starter: "Email · 48h",
        professional: "Priority · 24h",
        business: "Dedicated · 4h",
      },
    ],
  },
];

export function Pricing() {
  const locale = useLocale();
  const t = useTranslations("landing_page_home.pricing");
  const { toast } = useToast();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const currency = getLocaleCurrency(locale);
  const [isCompareOpen, setIsCompareOpen] = useState(false);

  useEffect(() => {
    if (isCompareOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isCompareOpen]);

  const handleCtaClick = (planName: string, isContactSales: boolean) => {
    if (isContactSales) {
      toast.success(t("toast.contact"));
      window.location.href =
        "mailto:sales@bookingbase.com?subject=BookingBase%20Business%20Plan%20Inquiry";
    } else {
      toast.success(t("toast.redirect", { plan: planName }));
      window.location.href = "/sign-up";
    }
  };

  const getPriceConfig = (planId: "starter" | "professional" | "business") => {
    const config = PLAN_PRICES[currency];
    const rawVal =
      billing === "monthly" ? config.monthly[planId] : config.annual[planId];

    let formattedVal = "";
    if (currency === "VND") {
      formattedVal = rawVal.toLocaleString("vi-VN");
    } else {
      formattedVal = rawVal.toLocaleString("en-US");
    }

    return {
      symbol: config.symbol,
      value: formattedVal,
      pos: config.pos,
      savings: config.savings[planId],
    };
  };

  return (
    <RepeatReveal
      as="section"
      id="pricing"
      className="scroll-mt-20 md:scroll-mt-24 py-24 lg:py-32 bg-surface relative overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-5xl mx-auto mb-14 sm:mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.14] text-balance">
            {t("title")}
            <br />
            <span className="text-muted-foreground font-bold">
              {t("titleHighlight")}
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Toggle Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 select-none">
          <div className="inline-flex items-center bg-surface border border-border rounded-full p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-7 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer ${
                billing === "monthly"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t("monthly")}
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`px-7 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                billing === "annual"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>{t("annual")}</span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  billing === "annual"
                    ? "bg-primary-hover text-primary-foreground"
                    : "bg-success-surface border border-success-border text-success-surface-foreground"
                }`}
              >
                {t("save20")}
              </span>
            </button>
          </div>
        </div>

        {/* Social Proof Line */}
        <div className="mb-10 flex flex-col items-center gap-2 text-center text-sm leading-relaxed text-muted-foreground select-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-0">
          <span className="text-balance">
            <span className="sm:hidden">{t("social.trustedMobile")} </span>
            <strong className="text-foreground">
              {t("social.businesses")}
            </strong>
            <span className="hidden sm:inline">
              {" "}
              {t("social.trustedDesktop")}
            </span>
          </span>
          <span
            className="mx-2 hidden text-muted-foreground sm:inline"
            aria-hidden="true"
          >
            ·
          </span>
          <span className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-0.5">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-warning-500 font-bold" aria-hidden="true">
                ★★★★★
              </span>
              <strong className="text-foreground">
                <span className="sm:hidden">{t("social.ratingShort")}</span>
                <span className="hidden sm:inline">
                  {t("social.ratingLong")}
                </span>
              </strong>
            </span>
            <span className="whitespace-nowrap">
              <span className="sm:hidden">· {t("social.reviews")}</span>
              <span className="hidden sm:inline">
                {t("social.reviewsLong")}
              </span>
            </span>
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <RepeatStaggerReveal className="grid gap-6 lg:gap-8 lg:grid-cols-3 items-stretch mb-10">
          {PLANS.map((plan) => {
            const priceCfg = getPriceConfig(plan.id);
            const isContactSales = plan.id === "business";

            let savingsText = "";
            if (billing === "annual") {
              if (currency === "VND") {
                savingsText = t("annualSavings", {
                  amount: `${priceCfg.savings.toLocaleString("vi-VN")} ₫`,
                });
              } else {
                savingsText = t("annualSavings", {
                  amount: `${priceCfg.symbol}${priceCfg.savings}`,
                });
              }
            }

            return (
              <RepeatStaggerItem key={plan.id} className="h-full">
                <PricingCard
                  featured={plan.popular}
                  className={`h-full border-2 rounded-3xl bg-surface p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 relative select-none ${
                    plan.popular
                      ? "border-primary shadow-2xl z-10"
                      : "border-border shadow-xs hover:border-primary/40 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-extrabold tracking-wider px-4 py-1 uppercase rounded-full shadow-md flex items-center justify-center select-none">
                      {t("mostPopular")}
                    </span>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-2xl font-black text-foreground tracking-tight">
                        {t(`plans.${plan.id}.name`)}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed min-h-[40px] lg:min-h-18 xl:min-h-[40px]">
                        {t(`plans.${plan.id}.description`)}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-x-1 gap-y-1 pt-4 lg:min-h-24 border-t border-border select-none">
                      {priceCfg.pos === "prefix" && (
                        <span className="text-2xl font-bold text-foreground">
                          {priceCfg.symbol}
                        </span>
                      )}

                      <div className="min-w-0 max-w-full flex items-baseline">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={`${billing}-${currency}-${plan.id}`}
                            initial={{ y: 6, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -6, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className={
                              currency === "VND"
                                ? "text-4xl sm:text-5xl lg:text-4xl xl:text-5xl font-black text-foreground tracking-tight inline-block whitespace-nowrap"
                                : "text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight inline-block whitespace-nowrap"
                            }
                          >
                            {priceCfg.value}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      {priceCfg.pos === "suffix" && (
                        <span className="text-xl font-bold text-foreground ml-0.5">
                          {priceCfg.symbol}
                        </span>
                      )}
                      <span
                        className={`text-sm text-muted-foreground font-semibold ${
                          locale === "vi" ? "basis-full" : "ml-1"
                        }`}
                      >
                        {t("perMonth")}
                      </span>
                    </div>

                    <div className="text-xs select-none min-h-[20px]">
                      {billing === "annual" ? (
                        <span className="text-success-surface-foreground font-bold bg-success-surface border border-success-border px-2.5 py-1 rounded-md">
                          {savingsText}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          {t("billedMonthly")}
                        </span>
                      )}
                    </div>

                    {/* Keep plan summaries aligned across the cards. */}
                    <div className="min-h-18 lg:min-h-28 xl:min-h-18 flex items-start gap-2.5 rounded-2xl border border-border bg-muted/70 px-3.5 py-3 text-left select-none">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-primary"
                        aria-hidden="true"
                      />
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm font-bold leading-snug text-foreground">
                          {plan.everything_in
                            ? t("everythingIn", {
                                plan: t(
                                  `plans.${plan.everything_in.toLowerCase()}.name`,
                                ),
                              })
                            : t("starterSummary.title")}
                        </p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                          {plan.everything_in
                            ? t("everythingInExtra")
                            : t("starterSummary.description")}
                        </p>
                      </div>
                    </div>

                    {/* SINGLE-COLUMN GROUPED FEATURES LIST */}
                    <div className="space-y-4 pt-5 border-t border-border">
                      {plan.features.map((grp, gidx) => (
                        <div key={gidx} className="space-y-2">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                            {t(`plans.${plan.id}.groups.${gidx}.title`)}
                          </h4>
                          <ul className="space-y-2.5">
                            {grp.items.map((feat, fidx) => (
                              <li
                                key={fidx}
                                className="flex items-start gap-2.5 text-sm font-medium text-foreground leading-snug"
                              >
                                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>
                                  {t(
                                    `plans.${plan.id}.groups.${gidx}.items.${fidx}`,
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 space-y-2">
                    {isContactSales ? (
                      <button
                        type="button"
                        onClick={() =>
                          handleCtaClick(t(`plans.${plan.id}.name`), true)
                        }
                        className="w-full inline-flex h-13 sm:h-14 items-center justify-center rounded-full border-2 border-input hover:border-primary bg-surface hover:bg-muted text-sm sm:text-base font-bold text-foreground transition-all cursor-pointer select-none active:scale-[0.98] shadow-xs"
                      >
                        <span>{t(`plans.${plan.id}.cta`)}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleCtaClick(t(`plans.${plan.id}.name`), false)
                        }
                        className={`w-full inline-flex h-13 sm:h-14 items-center justify-center rounded-full text-sm sm:text-base font-bold transition-all cursor-pointer select-none active:scale-[0.98] shadow-xs ${
                          plan.popular
                            ? "bg-primary hover:bg-primary-hover text-primary-foreground shadow-md"
                            : "border-2 border-input hover:border-primary bg-surface hover:bg-muted text-foreground"
                        }`}
                      >
                        {t(`plans.${plan.id}.cta`)}
                      </button>
                    )}

                    <p className="text-[11px] text-muted-foreground text-center select-none font-medium">
                      {isContactSales ? t("customTrial") : t("trialIncluded")}
                    </p>
                  </div>
                </PricingCard>
              </RepeatStaggerItem>
            );
          })}
        </RepeatStaggerReveal>

        {/* Compare Features Trigger Button */}
        <div className="text-center mt-8 mb-4">
          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full border-2 border-input bg-surface hover:bg-primary hover:text-primary-foreground hover:border-primary text-sm sm:text-base font-extrabold text-foreground shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.98] group"
          >
            <span>{t("compare")}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
          </button>
        </div>

        {/* Comparison Modal Overlay */}
        <AnimatePresence>
          {isCompareOpen && (
            <Dialog open={isCompareOpen} onOpenChange={setIsCompareOpen}>
              <DialogContent className="w-[min(calc(100vw-2rem),76rem)] sm:w-[min(calc(100vw-3rem),84rem)] max-w-7xl max-h-[90dvh] h-[88vh] rounded-3xl p-6 sm:p-10 lg:p-12 flex flex-col bg-surface border border-border shadow-2xl overflow-hidden">
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-border/80 pb-6 mb-6 shrink-0 gap-6">
                  <div>
                    <DialogTitle className="text-2xl sm:text-3xl lg:text-4xl font-black text-foreground tracking-tight">
                      {t("comparison.title")}
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">
                      {t("comparison.description")}
                    </DialogDescription>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompareOpen(false)}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-input hover:border-primary bg-surface hover:bg-muted flex items-center justify-center text-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-xs select-none shrink-0"
                    aria-label={t("comparison.close")}
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </button>
                </div>

                {/* Scrollable table container */}
                <div className="overflow-auto flex-1 rounded-2xl border border-border/90 bg-surface shadow-xs">
                  <table className="w-full border-collapse min-w-[700px]">
                    <thead className="sticky top-0 bg-muted/95 backdrop-blur-md z-20 select-none [&_th]:align-top [&_th]:whitespace-nowrap [&_th]:shadow-[inset_0_-1px_0_var(--color-border)]">
                      <tr>
                        <th className="w-[37%] px-6 sm:px-8 py-5 text-left text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-wider">
                          {t("comparison.feature")}
                        </th>
                        <th className="w-[21%] px-6 sm:px-8 py-5 text-left text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-wider border-l border-border">
                          {t("plans.starter.name")}
                        </th>
                        <th className="w-[21%] px-6 sm:px-8 py-5 text-left text-xs sm:text-sm font-black text-foreground uppercase tracking-wider bg-muted/80 border-x border-border">
                          <div className="flex flex-col items-start gap-2">
                            <span className="whitespace-nowrap">
                              {t("plans.professional.name")}
                            </span>
                            <span className="shrink-0 whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] leading-none font-black bg-primary text-primary-foreground tracking-normal uppercase">
                              {t("mostPopular")}
                            </span>
                          </div>
                        </th>
                        <th className="w-[21%] px-6 sm:px-8 py-5 text-left text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-wider">
                          {t("plans.business.name")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISONS.map((group, gidx) => (
                        <Fragment key={gidx}>
                          <tr className="bg-muted/60 select-none">
                            <td
                              colSpan={4}
                              className="px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black text-foreground uppercase tracking-wider border-y border-border"
                            >
                              {t(`comparison.groups.${gidx}.title`)}
                            </td>
                          </tr>
                          {group.rows.map((row, ridx) => (
                            <tr
                              key={ridx}
                              className="border-b border-border/70 hover:bg-muted/80 transition-colors"
                            >
                              <td className="px-6 sm:px-8 py-4 sm:py-5 align-top">
                                <span className="text-sm sm:text-base font-bold text-foreground block">
                                  {t(
                                    `comparison.groups.${gidx}.rows.${ridx}.name`,
                                  )}
                                </span>
                                {row.desc && (
                                  <span className="text-xs sm:text-sm text-muted-foreground block mt-1 leading-snug">
                                    {t(
                                      `comparison.groups.${gidx}.rows.${ridx}.desc`,
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base text-foreground font-medium align-middle border-l border-border/80">
                                {typeof row.starter === "boolean" ? (
                                  row.starter ? (
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground shadow-xs">
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground font-medium text-lg select-none">
                                      —
                                    </span>
                                  )
                                ) : (
                                  <span className="text-foreground font-medium">
                                    {t(
                                      `comparison.groups.${gidx}.rows.${ridx}.starter`,
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base text-foreground font-bold bg-muted/40 border-x border-border/80 align-middle">
                                {typeof row.professional === "boolean" ? (
                                  row.professional ? (
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground shadow-xs">
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground font-medium text-lg select-none">
                                      —
                                    </span>
                                  )
                                ) : (
                                  <span className="text-foreground font-black">
                                    {t(
                                      `comparison.groups.${gidx}.rows.${ridx}.professional`,
                                    )}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base text-foreground font-medium align-middle">
                                {typeof row.business === "boolean" ? (
                                  row.business ? (
                                    <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground shadow-xs">
                                      <Check className="w-4 h-4 stroke-[3]" />
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground font-medium text-lg select-none">
                                      —
                                    </span>
                                  )
                                ) : (
                                  <span className="text-foreground font-medium">
                                    {t(
                                      `comparison.groups.${gidx}.rows.${ridx}.business`,
                                    )}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 sm:pt-6 mt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>{t("comparison.footer")}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCompareOpen(false)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-input hover:bg-muted text-xs sm:text-sm font-bold text-foreground transition cursor-pointer"
                  >
                    {t("comparison.close")}
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Footer Notes */}
        <div className="text-center mt-5 select-none">
          <p className="text-sm leading-relaxed text-muted-foreground flex items-start justify-center gap-2">
            <Lock className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{t("footerNote")}</span>
          </p>
        </div>
      </div>
    </RepeatReveal>
  );
}

import React from "react";
