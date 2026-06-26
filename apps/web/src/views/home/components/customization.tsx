"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  LayoutDashboard,
  Check,
  RotateCcw,
  Mail,
  Settings,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { formatSlug, getHexColorValue, isHexColor } from "../home.utils";
import { CustomizationProps, ToastMsg } from "../home.types";
import { COLOR_SWATCHES, TYPOGRAPHY_PRESETS } from "../home.constants";

export function Customization({
  customColor,
  setCustomColor,
  customRequireDeposit,
  setCustomRequireDeposit,
  customSMS,
  setCustomSMS,
  customStaff,
  setCustomStaff,
  customBusinessName,
  setCustomBusinessName,
  customSelectedStaff,
  setCustomSelectedStaff,
}: CustomizationProps) {
  const shouldReduceMotion = useReducedMotion();

  // Local state as specified in SPEC-live-customizer.md
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [fontFamily, setFontFamily] = useState<string>("'Inter', sans-serif");
  const [trustBadges, setTrustBadges] = useState<boolean>(true);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const [pulseCta, setPulseCta] = useState<boolean>(false);

  // Refs for files, colors, timeouts
  const fileInputRef = useRef<HTMLInputElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isFirstMount = useRef<boolean>(true);

  const prevRequireDeposit = useRef(customRequireDeposit);
  const prevSMS = useRef(customSMS);
  const prevStaff = useRef(customStaff);
  const prevTrustBadges = useRef(trustBadges);

  // Dynamically load Google Fonts on mount
  useEffect(() => {
    const linkId = "customizer-google-fonts";
    if (!document.getElementById(linkId)) {
      const link = document.createElement("link");
      link.id = linkId;
      link.rel = "stylesheet";
      link.href =
        "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Manrope:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap";
      document.head.appendChild(link);
    }
  }, []);

  // Update effect to trigger the "Updating..." pill on state changes
  useEffect(() => {
    if (!isFirstMount.current) {
      setIsUpdating(true);
      if (updateTimeoutRef.current) clearTimeout(updateTimeoutRef.current);
      updateTimeoutRef.current = setTimeout(() => {
        setIsUpdating(false);
      }, 600);
    } else {
      isFirstMount.current = false;
    }
  }, [
    customColor,
    customRequireDeposit,
    customSMS,
    customStaff,
    customBusinessName,
    logoDataUrl,
    fontFamily,
    trustBadges,
    customSelectedStaff,
  ]);

  // Pulse effect on Booking Rules checkboxes changes
  useEffect(() => {
    if (
      prevRequireDeposit.current !== customRequireDeposit ||
      prevSMS.current !== customSMS ||
      prevStaff.current !== customStaff ||
      prevTrustBadges.current !== trustBadges
    ) {
      setPulseCta(false);
      const timer = setTimeout(() => {
        setPulseCta(true);
      }, 10);
      return () => clearTimeout(timer);
    }
    prevRequireDeposit.current = customRequireDeposit;
    prevSMS.current = customSMS;
    prevStaff.current = customStaff;
    prevTrustBadges.current = trustBadges;
  }, [customRequireDeposit, customSMS, customStaff, trustBadges]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setLogoDataUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBookClick = () => {
    if (customSMS && customRequireDeposit) {
      const now = new Date();
      const futureDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const timeStr = `${days[futureDate.getDay()]} at 2:30 PM`;

      const newToast: ToastMsg = {
        id: Math.random().toString(),
        businessName: customBusinessName || "Lumière",
        timeStr,
      };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        if (updated.length > 4) {
          updated.shift();
        }
        return updated;
      });
    }
  };

  const handleReset = () => {
    setCustomBusinessName("Lumière");
    setCustomColor("brand-blue");
    setCustomRequireDeposit(true);
    setCustomSMS(true);
    setCustomStaff(true);
    setCustomSelectedStaff("emily");
    setLogoDataUrl(null);
    setFontFamily("'Inter', sans-serif");
    setTrustBadges(true);
  };

  const hexColor = getHexColorValue(customColor);

  return (
    <RepeatReveal
      id="customization"
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-bg-primary border-t border-border-light"
    >
      {/* Inject custom pulse keyframes dynamically depending on current brand color */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes customPulse {
          0% { box-shadow: 0 0 0 0 ${hexColor}80; }
          100% { box-shadow: 0 0 0 14px transparent; }
        }
      `,
        }}
      />

      <div className="mx-auto max-w-7xl px-6">
        {/* Centered Section Header above the panels */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span
            className="text-xs font-bold uppercase tracking-wider block"
            style={{ color: hexColor }}
          >
            Live Customization
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[38px] font-extrabold tracking-tight text-text-primary leading-tight">
            Customize every template to match your brand
          </h2>
          <p className="text-text-muted text-base max-w-2xl mx-auto leading-relaxed">
            Change your logo, brand color, and typography — your booking page
            updates instantly.
          </p>
        </div>

        {/* Symmetric Grid with equal-aligned tops */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Interactive Customization Panel */}
          <div className="flex flex-col space-y-4 w-full">
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Settings className="w-3.5 h-3.5" />
              BRAND & BOOKING SETTINGS
            </span>
            {/* Control Panel Card */}
            <div className="p-6 bg-bg-secondary border border-border-light rounded-2xl space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: hexColor }}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">
                  Brand & booking settings
                </h3>
              </div>

              {/* 1. Business Name Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Business name
                </label>
                <input
                  type="text"
                  maxLength={32}
                  value={customBusinessName}
                  onChange={(e) => setCustomBusinessName(e.target.value)}
                  className="w-full px-3 py-2 border border-border-light rounded-lg text-xs focus:outline-none focus:border-brand-blue bg-white"
                  placeholder="e.g. Lumière"
                  style={
                    {
                      "--tw-ring-color": hexColor + "1f",
                    } as React.CSSProperties
                  }
                />
              </div>

              {/* 2. Logo Upload Field */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Logo
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-lg border border-border-light flex items-center justify-center shrink-0 overflow-hidden font-bold select-none"
                    style={{
                      backgroundColor: logoDataUrl
                        ? "transparent"
                        : hexColor + "14",
                      color: hexColor,
                    }}
                  >
                    {logoDataUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={logoDataUrl}
                        alt="Logo"
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <span className="text-base uppercase">
                        {(customBusinessName && customBusinessName[0]) || "B"}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-grow py-2 px-4 border border-dashed border-border-light hover:border-text-primary hover:text-text-primary rounded-full text-xs font-semibold text-text-muted transition cursor-pointer text-center bg-white"
                  >
                    Upload PNG / SVG
                  </button>
                  {logoDataUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoDataUrl(null)}
                      className="text-rose-500 hover:text-rose-600 text-xs font-bold px-2 py-1 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </div>
              </div>

              {/* 3. Color Swatches */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Brand color
                </label>
                <div className="flex flex-wrap gap-3 items-center">
                  {COLOR_SWATCHES.map((col) => {
                    const isSelected = customColor === col.name;
                    return (
                      <button
                        key={col.name}
                        type="button"
                        onClick={() => setCustomColor(col.name)}
                        className={`w-7 h-7 rounded-full ${
                          col.class
                        } relative transition transform active:scale-95 focus:outline-none hover:scale-[1.08] cursor-pointer ${
                          isSelected
                            ? "ring-[1.5px] ring-text-primary ring-offset-4"
                            : "border border-black/5"
                        }`}
                        aria-label={`Select color ${col.label}`}
                        aria-pressed={isSelected}
                      />
                    );
                  })}

                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => colorInputRef.current?.click()}
                      className={`h-7 px-3 rounded-full border text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 hover:bg-bg-secondary cursor-pointer ${
                        isHexColor(customColor)
                          ? "border-text-primary bg-bg-secondary text-text-primary"
                          : "border-border-light bg-white text-text-muted"
                      }`}
                      aria-label="Custom color picker"
                      aria-pressed={isHexColor(customColor)}
                    >
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-black/10 shrink-0"
                        style={{
                          background: isHexColor(customColor)
                            ? customColor
                            : "linear-gradient(135deg, #ec4899 0%, #3b82f6 50%, #10b981 100%)",
                        }}
                      />
                      <span>Custom</span>
                    </button>
                    <input
                      ref={colorInputRef}
                      type="color"
                      value={isHexColor(customColor) ? customColor : "#111827"}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="absolute opacity-0 pointer-events-none w-0 h-0"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Typography Presets */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
                  Typography
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {TYPOGRAPHY_PRESETS.map((font) => {
                    const isSelected = fontFamily === font.value;
                    return (
                      <button
                        key={font.name}
                        type="button"
                        onClick={() => setFontFamily(font.value)}
                        className={`py-2 px-2.5 rounded-lg border text-left flex flex-col justify-between h-[52px] transition active:scale-95 cursor-pointer ${
                          isSelected
                            ? "border-text-primary bg-bg-secondary text-text-primary shadow-sm"
                            : "border-border-light bg-white text-text-secondary hover:border-text-muted"
                        }`}
                        style={{ fontFamily: font.value }}
                      >
                        <span className="text-xs font-bold leading-none">
                          Aa
                        </span>
                        <span className="text-[9px] font-bold text-text-muted block tracking-tight truncate leading-none uppercase">
                          {font.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 5. Booking Rules Checkboxes */}
              <div className="space-y-3 pt-4 border-t border-border-light">
                <label className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block mb-1">
                  Booking rules
                </label>
                <div className="space-y-3">
                  {[
                    {
                      checked: customRequireDeposit,
                      onChange: setCustomRequireDeposit,
                      label: "Require online deposit",
                      sub: "Secure appointments with a small upfront payment.",
                    },
                    {
                      checked: customSMS,
                      onChange: setCustomSMS,
                      label: "Automated SMS reminders",
                      sub: "Send confirmation and reminder messages automatically.",
                    },
                    {
                      checked: customStaff,
                      onChange: setCustomStaff,
                      label: "Allow staff selector",
                      sub: "Let customers choose a preferred team member.",
                    },
                    {
                      checked: trustBadges,
                      onChange: setTrustBadges,
                      label: "Show trust badges",
                      sub: "Display 'Instant Confirmation' and 'Secure Deposit' badges.",
                    },
                  ].map((rule, idx) => (
                    <label
                      key={idx}
                      className="flex items-start gap-3 cursor-pointer group py-1"
                    >
                      <input
                        type="checkbox"
                        checked={rule.checked}
                        onChange={(e) => rule.onChange(e.target.checked)}
                        className="sr-only"
                      />
                      <div
                        className={`w-[18px] h-[18px] rounded-[5px] border flex items-center justify-center shrink-0 transition duration-150 mt-0.5 ${
                          rule.checked
                            ? "border-transparent text-white"
                            : "border-border-light bg-white group-hover:border-text-muted"
                        }`}
                        style={{
                          backgroundColor: rule.checked ? hexColor : undefined,
                          borderColor: rule.checked ? hexColor : undefined,
                        }}
                      >
                        {rule.checked && (
                          <span className="w-1.5 h-2.5 border-r-2 border-b-2 border-white transform rotate-45 -translate-y-[1px]" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-text-primary group-hover:text-brand-blue transition-colors">
                          {rule.label}
                        </span>
                        <span className="text-[10px] text-text-muted mt-0.5">
                          {rule.sub}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* 6. Reset button */}
              <div className="pt-4 border-t border-border-light">
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-border-light hover:border-text-primary hover:text-text-primary text-[10.5px] font-bold text-text-muted rounded-full transition cursor-pointer bg-white"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset to defaults
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Live Customized Booking Page Mockup */}
          <div className="flex flex-col space-y-4 w-full relative">
            <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5" />
              LIVE CUSTOMIZED PREVIEW
            </span>

            <div className="w-full relative max-w-[550px]">
              {/* "Updating..." pill absolute top-right of preview card */}
              <AnimatePresence>
                {isUpdating && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -5 }}
                    className="absolute top-[56px] right-4 bg-gray-900/90 text-white text-[9.5px] font-bold py-1 px-2.5 rounded-full flex items-center gap-1.5 shadow-sm z-50 border border-white/5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Updating...</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="w-full bg-white border border-border-light rounded-xl shadow-2xl overflow-hidden select-none flex flex-col h-[620px]">
                {/* Browser bar top */}
                <div className="flex items-center justify-between p-3 border-b border-border-light/60 bg-bg-secondary shrink-0">
                  <div className="flex items-center gap-1.5 w-16">
                    <div className="w-3 h-3 rounded-full bg-red-400 border border-black/10" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400 border border-black/10" />
                    <div className="w-3 h-3 rounded-full bg-green-400 border border-black/10" />
                  </div>
                  <div className="bg-white text-[9px] font-medium text-text-muted px-4 py-1.5 rounded-md border border-border-light w-full max-w-xs truncate text-center shadow-sm">
                    bookingbase.com/
                    {formatSlug(customBusinessName) || "your-brand"}
                  </div>
                  <div className="w-16" />
                </div>

                {/* Mockup Content */}
                <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] bg-bg-primary p-5 pb-16 relative">
                  {/* Website Header */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white font-extrabold text-xs shadow-sm overflow-hidden shrink-0"
                        style={{
                          backgroundColor: logoDataUrl
                            ? "transparent"
                            : hexColor,
                        }}
                      >
                        {logoDataUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img
                            src={logoDataUrl}
                            alt="Logo"
                            className="w-full h-full object-contain p-0.5"
                          />
                        ) : (
                          (customBusinessName && customBusinessName[0]) || "B"
                        )}
                      </div>
                      <h3 className="text-xs font-bold text-text-primary">
                        {customBusinessName || "Your Service Brand"}
                      </h3>
                    </div>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-text-muted">
                      <span>Services</span>
                      <span>Team</span>
                      <span>Reviews</span>
                    </div>
                  </div>

                  {/* Booking Card */}
                  <div
                    className="max-w-sm mx-auto bg-white border border-border-light rounded-xl p-4 shadow-sm space-y-4 relative transition-[font-family] duration-300"
                    style={{ fontFamily }}
                  >
                    {/* Trust Badges inside Booking Card */}
                    <AnimatePresence initial={false}>
                      {trustBadges && (
                        <motion.div
                          initial={
                            shouldReduceMotion
                              ? { opacity: 1 }
                              : { height: 0, opacity: 0, margin: 0 }
                          }
                          animate={{
                            height: "auto",
                            opacity: 1,
                            marginBottom: 8,
                          }}
                          exit={
                            shouldReduceMotion
                              ? { opacity: 0 }
                              : { height: 0, opacity: 0, margin: 0 }
                          }
                          transition={{ duration: 0.3 }}
                          className="flex items-center justify-center gap-3 text-[8.5px] font-bold text-[#16a34a] bg-[#f0fdf4] border border-[#bbf7d0] py-1.5 px-3 rounded-full max-w-[280px] mx-auto select-none overflow-hidden"
                        >
                          <span className="flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 shrink-0" />
                            Instant Confirmation
                          </span>
                          <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
                          <span className="flex items-center gap-1">
                            <Check className="w-2.5 h-2.5 shrink-0" />
                            Secure Deposit
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Step 1: Services */}
                    <div>
                      <span className="text-[9px] font-extrabold text-text-muted block uppercase tracking-wider mb-2">
                        1. Select service
                      </span>
                      <div className="border border-border-light rounded-lg p-3 cursor-pointer hover:border-text-secondary transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[11px] font-bold text-text-primary block">
                              Signature Hot Stone Session
                            </span>
                            <span className="text-[9px] text-text-muted mt-1 block">
                              65 mins • Personal Care
                            </span>
                          </div>
                          <span
                            className="text-xs font-bold animate-fade-in"
                            style={{ color: hexColor }}
                          >
                            $75.00
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Staff Selection */}
                    <AnimatePresence initial={false}>
                      {customStaff && (
                        <motion.div
                          initial={
                            shouldReduceMotion
                              ? { height: "auto", opacity: 1 }
                              : { height: 0, opacity: 0, overflow: "hidden" }
                          }
                          animate={{
                            height: "auto",
                            opacity: 1,
                            overflow: "visible",
                          }}
                          exit={
                            shouldReduceMotion
                              ? { height: "auto", opacity: 1 }
                              : { height: 0, opacity: 0, overflow: "hidden" }
                          }
                          transition={{ duration: 0.25, ease: "easeInOut" }}
                        >
                          <div className="pt-2">
                            <span className="text-[9px] font-extrabold text-text-muted block uppercase tracking-wider mb-2">
                              2. Choose specialist
                            </span>
                            <div className="grid grid-cols-2 gap-2">
                              {[
                                {
                                  id: "emily",
                                  name: "Emily Cooper",
                                  role: "Spa Therapist",
                                  initials: "EC",
                                },
                                {
                                  id: "sarah",
                                  name: "Sarah Jennings",
                                  role: "Lead Masseuse",
                                  initials: "SJ",
                                },
                              ].map((staff) => {
                                const isSelected =
                                  customSelectedStaff === staff.id;
                                return (
                                  <button
                                    key={staff.id}
                                    type="button"
                                    onClick={() =>
                                      setCustomSelectedStaff(staff.id)
                                    }
                                    className={`p-2 rounded-lg border text-left flex items-center gap-2 transition active:scale-95 cursor-pointer ${
                                      isSelected
                                        ? "border-text-primary bg-bg-secondary"
                                        : "border-border-light hover:border-text-muted"
                                    }`}
                                  >
                                    <div
                                      className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white shrink-0"
                                      style={{ backgroundColor: hexColor }}
                                    >
                                      {staff.initials}
                                    </div>
                                    <div className="truncate">
                                      <span className="text-[10px] font-bold text-text-primary block leading-tight">
                                        {staff.name}
                                      </span>
                                      <span className="text-[8px] text-text-muted block leading-none mt-0.5">
                                        {staff.role}
                                      </span>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Step 3: Date & Time Selector */}
                    <div>
                      <span className="text-[9px] font-extrabold text-text-muted block uppercase tracking-wider mb-2">
                        3. Pick date & time
                      </span>
                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        {["09:00 AM", "10:30 AM", "01:00 PM", "02:30 PM"].map(
                          (time) => {
                            const isSelected = time === "02:30 PM";
                            return (
                              <div
                                key={time}
                                className={`py-1.5 px-1 rounded-md text-[9.5px] font-bold border transition ${
                                  isSelected
                                    ? "text-white"
                                    : "border-border-light text-text-secondary hover:border-text-muted"
                                }`}
                                style={{
                                  backgroundColor: isSelected
                                    ? hexColor
                                    : undefined,
                                  borderColor: isSelected
                                    ? hexColor
                                    : undefined,
                                }}
                              >
                                {time}
                              </div>
                            );
                          },
                        )}
                      </div>
                    </div>

                    {/* Booking Form CTA Button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleBookClick}
                        className="w-full py-3 text-white text-[11px] font-bold rounded-full shadow-sm cursor-pointer transition-transform duration-200 active:scale-[0.98] hover:translate-y-[-1px]"
                        style={{
                          backgroundColor: hexColor,
                          animation: pulseCta
                            ? "customPulse 0.6s ease-out"
                            : undefined,
                        }}
                      >
                        {customRequireDeposit
                          ? "Book & Pay Deposit ($15.00)"
                          : "Book Appointment"}
                      </button>
                      <div className="flex items-center justify-center gap-1 mt-3">
                        <Check
                          className="w-3 h-3"
                          style={{ color: hexColor }}
                        />
                        <p className="text-[9px] text-text-muted text-center font-medium">
                          {customRequireDeposit
                            ? "Secure online deposit"
                            : "Standard booking"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* SMS Reminder Card */}
                  <AnimatePresence initial={false}>
                    {customSMS && (
                      <motion.div
                        initial={
                          shouldReduceMotion
                            ? { opacity: 1 }
                            : {
                                height: 0,
                                opacity: 0,
                                overflow: "hidden",
                                marginTop: 0,
                              }
                        }
                        animate={{
                          height: "auto",
                          opacity: 1,
                          overflow: "visible",
                          marginTop: 16,
                        }}
                        exit={
                          shouldReduceMotion
                            ? { opacity: 0 }
                            : {
                                height: 0,
                                opacity: 0,
                                overflow: "hidden",
                                marginTop: 0,
                              }
                        }
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="max-w-sm mx-auto bg-white border border-border-light rounded-xl shadow-sm p-4 select-none overflow-hidden"
                      >
                        <div className="flex items-start gap-2.5">
                          <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0"
                            style={{ backgroundColor: hexColor }}
                          >
                            <Mail className="w-3.5 h-3.5 text-white" />
                          </div>
                          <div className="flex-grow">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[9px] font-extrabold text-text-primary uppercase tracking-wider">
                                SMS reminder preview
                              </span>
                              <span className="text-[8px] text-text-muted">
                                Just now
                              </span>
                            </div>
                            <p className="text-[10px] text-text-secondary leading-snug text-left">
                              Hi Alex, your appointment at{" "}
                              <strong className="text-text-primary font-bold">
                                {customBusinessName || "your business"}
                              </strong>{" "}
                              is confirmed. We&apos;ll text you a reminder 24h
                              before.
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toast Portal container in bottom-right */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2.5 z-[100] pointer-events-none">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            msg={toast}
            brandColor={customColor}
            fontFamily={fontFamily}
            onRemove={() => {
              setToasts((prev) => prev.filter((t) => t.id !== toast.id));
            }}
          />
        ))}
      </div>
    </RepeatReveal>
  );
}

// Toast component representing SMS confirmation simulation
function Toast({
  msg,
  onRemove,
  brandColor,
  fontFamily,
}: {
  msg: ToastMsg;
  onRemove: () => void;
  brandColor: string;
  fontFamily: string;
}) {
  const [show, setShow] = useState<boolean>(false);
  const colorHex = getHexColorValue(brandColor);

  useEffect(() => {
    const showTimeout = setTimeout(() => setShow(true), 10);
    const hideTimeout = setTimeout(() => setShow(false), 6000);
    const removeTimeout = setTimeout(() => onRemove(), 6400);

    return () => {
      clearTimeout(showTimeout);
      clearTimeout(hideTimeout);
      clearTimeout(removeTimeout);
    };
  }, [onRemove]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`pointer-events-auto bg-white text-text-primary p-4 rounded-xl border border-border-light shadow-[0_10px_30px_rgba(0,0,0,0.08)] w-[340px] flex gap-3 transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        show ? "transform translate-x-0" : "transform translate-x-[120%]"
      }`}
      style={{ fontFamily }}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{
          backgroundColor: colorHex + "12",
        }}
      >
        <Mail className="w-4 h-4" style={{ color: colorHex }} />
      </div>
      <div className="space-y-1 text-left">
        <span className="text-[10px] font-extrabold text-text-muted uppercase tracking-wider block">
          BOOKING SMS · SENT
        </span>
        <p className="text-[11px] text-text-secondary leading-snug">
          Hi Alex, your appointment at{" "}
          <strong className="text-text-primary font-bold">
            {msg.businessName}
          </strong>{" "}
          is confirmed for{" "}
          <span className="text-text-primary font-bold">{msg.timeStr}</span>{" "}
          with Emily Cooper. We&apos;ll text you a reminder 24h before.
        </p>
      </div>
    </div>
  );
}
