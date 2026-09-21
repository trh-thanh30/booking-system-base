"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Check, ChevronDown, Lock, X, Globe } from "lucide-react";
import { toast } from "sonner";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { RepeatStaggerReveal } from "@/src/components/motion/RepeatStaggerReveal";
import { RepeatStaggerItem } from "@/src/components/motion/RepeatStaggerItem";
import { MotionButton } from "@/src/components/motion/MotionButton";

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
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [currency, setCurrency] = useState<"USD" | "EUR" | "VND">("USD");
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const shouldReduceMotion = useReducedMotion();

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
      className="scroll-mt-20 md:scroll-mt-24 py-10 md:py-12 lg:py-14 bg-bg-secondary border-t border-border-light relative overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-6 space-y-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50/50 px-3.5 py-0.5 text-[10px] font-bold text-brand-blue uppercase tracking-wider select-none">
            Simple Pricing
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-text-primary tracking-tight leading-tight">
            Choose a plan that grows with your service business
          </h2>
          <p className="text-text-muted text-xs leading-relaxed">
            Start with a 14-day trial. Upgrade, downgrade or cancel anytime — no
            long-term commitment.
          </p>
        </div>

        {/* Toggle Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-5 select-none">
          <div className="inline-flex items-center bg-white border border-border-light rounded-full p-1 shadow-sm">
            <button
              type="button"
              onClick={() => setBilling("monthly")}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                billing === "monthly"
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setBilling("annual")}
              className={`px-5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                billing === "annual"
                  ? "bg-brand-blue text-white shadow-sm"
                  : "text-text-muted hover:text-text-primary"
              }`}
            >
              <span>Annual</span>
              <span
                className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                  billing === "annual"
                    ? "bg-blue-400/30 text-white"
                    : "bg-emerald-50 border border-emerald-100 text-emerald-700"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>

          <div className="inline-flex items-center bg-white border border-border-light rounded-xl px-3 py-1 shadow-sm gap-1.5">
            <Globe className="w-3.5 h-3.5 text-text-muted" />
            <span className="text-xs text-text-muted font-bold">Currency:</span>
            <select
              value={currency}
              onChange={(e) =>
                setCurrency(e.target.value as "USD" | "EUR" | "VND")
              }
              className="text-xs font-extrabold text-text-primary bg-transparent outline-none cursor-pointer py-0.5"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="VND">VND (₫)</option>
            </select>
          </div>
        </div>

        {/* Social Proof Line */}
        <div className="text-center text-[11px] text-text-secondary select-none mb-5">
          <span>
            <strong>12,400+ businesses</strong> trust BookingBase
          </span>
          <span className="mx-2 text-border-gray">·</span>
          <span className="text-amber-500 font-bold mr-1">★★★★★</span>
          <span>
            <strong>4.8 avg rating</strong> from 1,820 customer reviews
          </span>
        </div>

        {/* Pricing Cards Grid */}
        <RepeatStaggerReveal className="grid gap-5 lg:grid-cols-3 items-stretch mb-6">
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
                <div
                  className={`h-full border rounded-2xl bg-white p-5 flex flex-col justify-between transition-all duration-300 relative ${
                    plan.popular
                      ? "border-brand-blue ring-4 ring-brand-blue/10 shadow-xl z-10 scale-[1.01]"
                      : "border-border-light shadow-sm hover:border-border-gray hover:shadow-md"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-brand-blue text-white text-[8px] font-extrabold tracking-wider px-3 py-0.5 uppercase rounded-full shadow-md flex items-center justify-center select-none">
                      Most popular
                    </span>
                  )}

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="text-lg font-extrabold text-text-primary">
                        {plan.name}
                      </h3>
                      <p className="text-[11px] text-text-muted leading-relaxed min-h-[34px]">
                        {plan.description}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-0.5 pt-3 border-t border-border-light select-none">
                      {priceCfg.pos === "prefix" && (
                        <span className="text-lg font-bold text-text-secondary">
                          {priceCfg.symbol}
                        </span>
                      )}

                      <div className="overflow-hidden min-h-[40px] flex items-baseline">
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={`${billing}-${currency}-${plan.id}`}
                            initial={{ y: 6, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -6, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeOut" }}
                            className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight inline-block"
                          >
                            {priceCfg.value}
                          </motion.span>
                        </AnimatePresence>
                      </div>

                      {priceCfg.pos === "suffix" && (
                        <span className="text-base font-bold text-text-secondary ml-0.5">
                          {priceCfg.symbol}
                        </span>
                      )}
                      <span className="text-xs text-text-muted font-bold ml-0.5">
                        /month
                      </span>
                    </div>

                    <div className="text-[10px] select-none min-h-[16px]">
                      {billing === "annual" ? (
                        <span className="text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md">
                          {savingsText}
                        </span>
                      ) : (
                        <span className="text-text-muted">
                          Billed monthly · cancel anytime
                        </span>
                      )}
                    </div>

                    {/* EVERYTHING IN BADGE */}
                    <div
                      className={`text-[9px] font-bold text-emerald-600 bg-emerald-50/80 border border-emerald-100 py-0.5 px-2 rounded text-center select-none ${
                        plan.everything_in
                          ? ""
                          : "opacity-0 pointer-events-none select-none"
                      }`}
                    >
                      {plan.everything_in
                        ? `✓ Everything in ${plan.everything_in}, plus:`
                        : "Placeholder"}
                    </div>

                    {/* TWO-COLUMN GROUPED FEATURES LIST */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3 pt-2 border-t border-border-light/50 min-h-[115px]">
                      {plan.features.map((grp, gidx) => (
                        <div key={gidx} className="space-y-1">
                          <h4 className="text-[9px] font-extrabold text-text-muted uppercase tracking-wider select-none">
                            {grp.group}
                          </h4>
                          <ul className="space-y-1.5">
                            {grp.items.map((feat, fidx) => (
                              <li
                                key={fidx}
                                className="flex items-start gap-1.5 text-[10px] text-text-secondary leading-tight"
                              >
                                <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 space-y-1.5">
                    {isContactSales ? (
                      <button
                        type="button"
                        onClick={() => handleCtaClick(plan.name, true)}
                        className="w-full inline-flex h-9 items-center justify-center rounded-full border border-border-strong hover:border-brand-blue bg-white hover:bg-blue-50/20 text-xs font-bold text-text-primary hover:text-brand-blue transition cursor-pointer select-none active:scale-[0.98]"
                      >
                        <span>{plan.cta}</span>
                      </button>
                    ) : (
                      <MotionButton
                        variant={plan.popular ? "primary" : "secondary"}
                        className="w-full text-xs font-bold h-9 cursor-pointer select-none"
                        onClick={() => handleCtaClick(plan.name, false)}
                      >
                        {plan.cta}
                      </MotionButton>
                    )}

                    <p className="text-[9px] text-text-muted text-center select-none font-medium">
                      {isContactSales
                        ? "Custom trial & support available"
                        : "14-day free trial included"}
                    </p>
                  </div>
                </div>
              </RepeatStaggerItem>
            );
          })}
        </RepeatStaggerReveal>

        {/* Compare Features Trigger Button */}
        <div className="text-center mt-2 mb-1">
          <button
            type="button"
            onClick={() => setIsCompareOpen(true)}
            className="inline-flex items-center gap-1.5 px-5 py-1.5 rounded-full border border-border-light bg-white hover:bg-bg-secondary hover:border-border-gray text-xs font-bold text-text-primary hover:text-brand-blue shadow-sm transition-all duration-200 cursor-pointer select-none active:scale-[0.98]"
          >
            <span>Compare all features in detail</span>
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {/* Comparison Modal Overlay */}
        <AnimatePresence>
          {isCompareOpen && (
            <div
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
              onClick={() => setIsCompareOpen(false)}
            >
              <motion.div
                initial={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.95, y: 15 }
                }
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={
                  shouldReduceMotion
                    ? { opacity: 1, scale: 1 }
                    : { opacity: 0, scale: 0.95, y: 15 }
                }
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="bg-white rounded-2xl w-full max-w-4xl p-6 sm:p-8 shadow-2xl relative max-h-[85vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-border-light pb-4 mb-4 shrink-0">
                  <div>
                    <h3 className="text-lg font-bold text-text-primary">
                      Detailed Feature Comparison
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">
                      Compare Starter, Professional, and Business tiers side by
                      side
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsCompareOpen(false)}
                    className="p-1.5 rounded-lg text-text-muted hover:bg-bg-secondary hover:text-text-primary transition cursor-pointer"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable table container */}
                <div className="overflow-y-auto flex-1 border border-border-light rounded-xl">
                  <table className="w-full border-collapse min-w-[600px]">
                    <thead className="sticky top-0 bg-bg-secondary z-10 select-none shadow-sm">
                      <tr>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-text-muted uppercase tracking-wider border-b border-border-light">
                          Feature
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-text-muted uppercase tracking-wider border-b border-border-light">
                          Starter
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-brand-blue uppercase tracking-wider border-b border-border-light bg-blue-50/20">
                          Professional
                        </th>
                        <th className="px-4 py-3 text-left text-[10px] font-extrabold text-text-muted uppercase tracking-wider border-b border-border-light">
                          Business
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {COMPARISONS.map((group, gidx) => (
                        <React.Fragment key={gidx}>
                          <tr className="bg-bg-primary/50 select-none">
                            <td
                              colSpan={4}
                              className="px-4 py-2.5 text-[10px] font-extrabold text-text-muted uppercase tracking-wider border-b border-border-light"
                            >
                              {group.group}
                            </td>
                          </tr>
                          {group.rows.map((row, ridx) => (
                            <tr
                              key={ridx}
                              className="hover:bg-bg-secondary/25 transition"
                            >
                              <td className="px-4 py-3 border-b border-border-light">
                                <span className="text-xs font-bold text-text-primary block">
                                  {row.name}
                                </span>
                                {row.desc && (
                                  <span className="text-[10px] text-text-muted block mt-0.5">
                                    {row.desc}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-text-secondary border-b border-border-light">
                                {typeof row.starter === "boolean" ? (
                                  row.starter ? (
                                    <span className="text-emerald-500 font-bold">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-text-muted opacity-40">
                                      —
                                    </span>
                                  )
                                ) : (
                                  row.starter
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-brand-blue font-bold border-b border-border-light bg-blue-50/10">
                                {typeof row.professional === "boolean" ? (
                                  row.professional ? (
                                    <span className="text-emerald-500 font-bold">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-text-muted opacity-40">
                                      —
                                    </span>
                                  )
                                ) : (
                                  row.professional
                                )}
                              </td>
                              <td className="px-4 py-3 text-xs text-text-secondary border-b border-border-light">
                                {typeof row.business === "boolean" ? (
                                  row.business ? (
                                    <span className="text-emerald-500 font-bold">
                                      ✓
                                    </span>
                                  ) : (
                                    <span className="text-text-muted opacity-40">
                                      —
                                    </span>
                                  )
                                ) : (
                                  row.business
                                )}
                              </td>
                            </tr>
                          ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Footer Notes */}
        <div className="text-center mt-5 select-none">
          <p className="text-[9px] text-text-muted flex items-center justify-center gap-1">
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
