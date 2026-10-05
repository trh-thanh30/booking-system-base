"use client";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  cn,
} from "@repo/ui";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown, Lock, X, Globe } from "lucide-react";
import { useToast } from "@repo/hooks";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { RepeatStaggerReveal } from "@/src/components/motion/RepeatStaggerReveal";
import { RepeatStaggerItem } from "@/src/components/motion/RepeatStaggerItem";
import { PricingCard } from "@/src/components/common/landing-compositions";

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

const CURRENCIES = [
  { code: "USD" as const, label: "USD ($)", flag: "/flags/us.svg" },
  { code: "EUR" as const, label: "EUR (€)", flag: "/flags/eu.svg" },
  { code: "VND" as const, label: "VND (₫)", flag: "/flags/vi.svg" },
];

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
  const { toast } = useToast();
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "VND">("USD");
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
      toast.success(
        "Opening contact form... Redirection to Sales Support scheduled.",
      );
      window.location.href =
        "mailto:sales@bookingbase.com?subject=BookingBase%20Business%20Plan%20Inquiry";
    } else {
      toast.success(`Redirecting to ${planName} trial registration →`);
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
      className="scroll-mt-20 md:scroll-mt-24 py-24 lg:py-32 bg-background border-t border-border relative overflow-hidden"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-5xl mx-auto mb-14 sm:mb-16 space-y-4">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.14] text-balance">
            Choose a plan that grows
            <br />
            <span className="text-muted-foreground font-bold">
              with your service&nbsp;business.
            </span>
          </h2>
          <p className="mt-5 text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-3xl mx-auto">
            Start with a 14-day trial. Upgrade, downgrade or cancel anytime — no
            long-term commitment.
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
              Monthly
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
              <span>Annual</span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                  billing === "annual"
                    ? "bg-primary-hover text-primary-foreground"
                    : "bg-success-surface border border-success-border text-success-surface-foreground"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 sm:px-5 py-2.5 text-sm font-bold text-foreground transition-all duration-200 shadow-xs cursor-pointer select-none active:scale-[0.98] hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 data-[state=open]:border-primary data-[state=open]:bg-muted"
              >
                <Globe className="w-4 h-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                <span className="text-sm text-muted-foreground font-semibold">
                  Currency:
                </span>
                <span className="relative flex h-3.5 w-5 shrink-0 overflow-hidden rounded-xs shadow-xs ring-1 ring-foreground/10">
                  <Image
                    src={
                      CURRENCIES.find((c) => c.code === currency)?.flag ??
                      "/flags/us.svg"
                    }
                    alt=""
                    width={20}
                    height={14}
                    className="h-full w-full object-cover"
                  />
                </span>
                <span className="text-sm font-extrabold text-foreground">
                  {currency} ({PLAN_PRICES[currency].symbol})
                </span>
                <ChevronDown
                  className="w-3.5 h-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="center"
              sideOffset={8}
              className="min-w-44 p-1.5 rounded-2xl border border-border bg-surface shadow-xl space-y-1 z-50"
            >
              {CURRENCIES.map((c) => {
                const isSelected = c.code === currency;
                return (
                  <DropdownMenuItem
                    key={c.code}
                    onClick={() => setCurrency(c.code)}
                    className={cn(
                      "flex items-center justify-between gap-3 px-4 py-2.5 rounded-full font-bold text-sm cursor-pointer transition-colors outline-none",
                      isSelected
                        ? "bg-primary text-primary-foreground hover:bg-primary-hover focus:bg-primary-hover focus:text-primary-foreground"
                        : "text-foreground hover:bg-muted hover:text-foreground focus:bg-muted focus:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="relative flex h-3.5 w-5 shrink-0 overflow-hidden rounded-xs shadow-xs ring-1 ring-foreground/15">
                        <Image
                          src={c.flag}
                          alt=""
                          width={20}
                          height={14}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span>{c.label}</span>
                    </div>
                    {isSelected && (
                      <Check
                        className="w-4 h-4 shrink-0 text-primary-foreground"
                        aria-hidden="true"
                      />
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Social Proof Line */}
        <div className="text-center text-sm text-muted-foreground select-none mb-10">
          <span>
            <strong className="text-foreground">12,400+ businesses</strong>{" "}
            trust BookingBase
          </span>
          <span className="mx-2 text-muted-foreground">·</span>
          <span className="text-warning-500 font-bold mr-1">★★★★★</span>
          <span>
            <strong className="text-foreground">4.8 avg rating</strong> from
            1,820 customer reviews
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
                savingsText = `Save ${priceCfg.savings.toLocaleString("vi-VN")} ₫/year`;
              } else {
                savingsText = `Save ${priceCfg.symbol}${priceCfg.savings}/year`;
              }
            }

            return (
              <RepeatStaggerItem key={plan.id} className="h-full">
                <PricingCard
                  featured={plan.popular}
                  className={`h-full border rounded-3xl bg-surface p-7 sm:p-9 flex flex-col justify-between transition-all duration-300 relative select-none ${
                    plan.popular
                      ? "border-2 border-primary shadow-2xl z-10 scale-[1.02]"
                      : "border border-border shadow-xs hover:border-primary/40 hover:shadow-lg"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-[10px] font-extrabold tracking-wider px-4 py-1 uppercase rounded-full shadow-md flex items-center justify-center select-none">
                      Most popular
                    </span>
                  )}

                  <div className="space-y-6">
                    <div className="space-y-1.5">
                      <h3 className="text-2xl font-black text-foreground tracking-tight">
                        {plan.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed min-h-[40px]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1 pt-4 border-t border-border select-none">
                      {priceCfg.pos === "prefix" && (
                        <span className="text-2xl font-bold text-foreground">
                          {priceCfg.symbol}
                        </span>
                      )}

                      <div className="overflow-hidden min-h-[48px] flex items-baseline">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={`${billing}-${currency}-${plan.id}`}
                            initial={{ y: 6, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -6, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground tracking-tight inline-block"
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
                      <span className="text-sm text-muted-foreground font-semibold ml-1">
                        /month
                      </span>
                    </div>

                    <div className="text-xs select-none min-h-[20px]">
                      {billing === "annual" ? (
                        <span className="text-success-surface-foreground font-bold bg-success-surface border border-success-border px-2.5 py-1 rounded-md">
                          {savingsText}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">
                          Billed monthly · cancel anytime
                        </span>
                      )}
                    </div>

                    {/* EVERYTHING IN BADGE */}
                    <div
                      className={`text-xs font-bold text-foreground bg-muted border border-border py-1.5 px-3 rounded-xl text-center select-none ${
                        plan.everything_in
                          ? ""
                          : "opacity-0 pointer-events-none select-none"
                      }`}
                    >
                      {plan.everything_in
                        ? `✓ Everything in ${plan.everything_in}, plus:`
                        : "Placeholder"}
                    </div>

                    {/* SINGLE-COLUMN GROUPED FEATURES LIST */}
                    <div className="space-y-4 pt-5 border-t border-border">
                      {plan.features.map((grp, gidx) => (
                        <div key={gidx} className="space-y-2">
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider select-none">
                            {grp.group}
                          </h4>
                          <ul className="space-y-2.5">
                            {grp.items.map((feat, fidx) => (
                              <li
                                key={fidx}
                                className="flex items-start gap-2.5 text-sm font-medium text-foreground leading-snug"
                              >
                                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span>{feat}</span>
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
                        onClick={() => handleCtaClick(plan.name, true)}
                        className="w-full inline-flex h-13 sm:h-14 items-center justify-center rounded-full border-2 border-input hover:border-primary bg-surface hover:bg-muted text-sm sm:text-base font-bold text-foreground transition-all cursor-pointer select-none active:scale-[0.98] shadow-xs"
                      >
                        <span>{plan.cta}</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleCtaClick(plan.name, false)}
                        className={`w-full inline-flex h-13 sm:h-14 items-center justify-center rounded-full text-sm sm:text-base font-bold transition-all cursor-pointer select-none active:scale-[0.98] shadow-xs ${
                          plan.popular
                            ? "bg-primary hover:bg-primary-hover text-primary-foreground shadow-md"
                            : "border-2 border-input hover:border-primary bg-surface hover:bg-muted text-foreground"
                        }`}
                      >
                        {plan.cta}
                      </button>
                    )}

                    <p className="text-[11px] text-muted-foreground text-center select-none font-medium">
                      {isContactSales
                        ? "Custom trial & support available"
                        : "14-day free trial included"}
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
            <span>Compare all features in detail</span>
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
                      Detailed Feature Comparison
                    </DialogTitle>
                    <DialogDescription className="text-sm sm:text-base text-muted-foreground mt-2 font-medium">
                      Compare Starter, Professional, and Business tiers side by
                      side to pick the right plan for your team
                    </DialogDescription>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompareOpen(false)}
                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-input hover:border-primary bg-surface hover:bg-muted flex items-center justify-center text-foreground hover:text-foreground transition-all duration-200 cursor-pointer shadow-xs select-none shrink-0"
                    aria-label="Close"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
                  </button>
                </div>

                {/* Scrollable table container */}
                <div className="overflow-y-auto flex-1 rounded-2xl border border-border/90 bg-surface shadow-xs">
                  <table className="w-full border-collapse min-w-[700px]">
                    <thead className="sticky top-0 bg-muted/95 backdrop-blur-md z-20 select-none border-b border-border shadow-xs">
                      <tr>
                        <th className="w-[37%] px-6 sm:px-8 py-5 text-left text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-wider">
                          Feature
                        </th>
                        <th className="w-[21%] px-6 sm:px-8 py-5 text-left text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-wider">
                          Starter
                        </th>
                        <th className="w-[21%] px-6 sm:px-8 py-5 text-left text-xs sm:text-sm font-black text-foreground uppercase tracking-wider bg-muted/80 border-x border-border">
                          <div className="flex items-center gap-2">
                            <span>Professional</span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-primary text-primary-foreground tracking-normal uppercase">
                              Popular
                            </span>
                          </div>
                        </th>
                        <th className="w-[21%] px-6 sm:px-8 py-5 text-left text-xs sm:text-sm font-black text-muted-foreground uppercase tracking-wider">
                          Business
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISONS.map((group, gidx) => (
                        <React.Fragment key={gidx}>
                          <tr className="bg-muted/60 select-none">
                            <td
                              colSpan={4}
                              className="px-6 sm:px-8 py-3.5 sm:py-4 text-xs sm:text-sm font-black text-foreground uppercase tracking-wider border-b border-border"
                            >
                              {group.group}
                            </td>
                          </tr>
                          {group.rows.map((row, ridx) => (
                            <tr
                              key={ridx}
                              className="border-b border-border/70 hover:bg-muted/80 transition-colors"
                            >
                              <td className="px-6 sm:px-8 py-4 sm:py-5 align-top">
                                <span className="text-sm sm:text-base font-bold text-foreground block">
                                  {row.name}
                                </span>
                                {row.desc && (
                                  <span className="text-xs sm:text-sm text-muted-foreground block mt-1 leading-snug">
                                    {row.desc}
                                  </span>
                                )}
                              </td>
                              <td className="px-6 sm:px-8 py-4 sm:py-5 text-sm sm:text-base text-foreground font-medium align-middle">
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
                                    {row.starter}
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
                                    {row.professional}
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
                                    {row.business}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Modal Footer */}
                <div className="pt-4 sm:pt-6 mt-4 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                    <span>
                      All plans include a 14-day free trial. No credit card
                      required.
                    </span>
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsCompareOpen(false)}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-input hover:bg-muted text-xs sm:text-sm font-bold text-foreground transition cursor-pointer"
                  >
                    Close comparison
                  </button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Footer Notes */}
        <div className="text-center mt-5 select-none">
          <p className="text-[9px] text-muted-foreground flex items-center justify-center gap-1">
            <Lock className="w-3 h-3" />
            <span>
              No credit card required. Trial accounts will not be auto-charged.
            </span>
          </p>
        </div>
      </div>
    </RepeatReveal>
  );
}

import React from "react";
