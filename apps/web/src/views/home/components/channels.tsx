"use client";

import { useState, useEffect, useRef } from "react";
import {
  Link as LinkIcon,
  QrCode,
  Code2,
  Share2,
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Calendar as CalendarIcon,
  Mail,
  Printer,
  Download,
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@repo/hooks";
import QRCode from "qrcode";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import {
  formatSlug,
  getHexColorValue,
  withColorAlpha,
} from "../utils/home.utils";

interface ChannelsProps {
  customColor: string;
  customBusinessName: string;
  setCustomBusinessName?: (val: string) => void;
}

type ChannelType = "url" | "qr" | "embed" | "social";
type EmbedVariantType = "calendar" | "button" | "overlay";

// Range Data for Stats
const STATS_DATA = {
  7: { clicks: 147, bookings: 23 },
  30: { clicks: 612, bookings: 91 },
  90: { clicks: 1843, bookings: 271 },
};

// Hook for smooth animated counting
function useAnimatedCounter(targetValue: number, duration: number = 500) {
  const [count, setCount] = useState(targetValue);

  useEffect(() => {
    const start = count;
    const end = targetValue;
    if (start === end) return;

    const startTime = performance.now();
    let animationFrameId: number;

    const updateCount = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // cubic easeOut
      const current = Math.floor(start + (end - start) * eased);
      setCount(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(updateCount);
      } else {
        setCount(end);
      }
    };

    animationFrameId = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrameId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetValue, duration]);

  return count;
}

export function Channels({
  customColor,
  customBusinessName,
  setCustomBusinessName,
}: ChannelsProps) {
  const { toast } = useToast();
  const hexColor = getHexColorValue(customColor);
  const slug = formatSlug(customBusinessName) || "lumiere";

  // State
  const [activeCard, setActiveCard] = useState<ChannelType>("url");
  const [channelsStatus, setChannelsStatus] = useState<
    Record<ChannelType, boolean>
  >({
    url: true,
    qr: true,
    embed: true,
    social: true,
  });
  const [utmSource, setUtmSource] = useState<string>("");
  const [embedVariant, setEmbedVariant] =
    useState<EmbedVariantType>("calendar");
  const [selectedRange, setSelectedRange] = useState<7 | 30 | 90>(7);

  // Live preview mockup state
  const [selectedSpecialist, setSelectedSpecialist] = useState<"EC" | "SJ">(
    "EC",
  );
  const [showSMS, setShowSMS] = useState<boolean>(true);

  // Refs
  const sliderTrackRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // Animate stats values
  const animatedClicks = useAnimatedCounter(STATS_DATA[selectedRange].clicks);
  const animatedBookings = useAnimatedCounter(
    STATS_DATA[selectedRange].bookings,
  );

  // Generate QR Code on canvas
  useEffect(() => {
    if (activeCard === "qr") {
      const qrUrl = `https://bookingbase.com/${slug}${
        utmSource
          ? `?utm_source=${utmSource}&utm_medium=qr&utm_campaign=storefront`
          : ""
      }`;
      if (canvasRef.current) {
        QRCode.toCanvas(
          canvasRef.current,
          qrUrl,
          {
            width: 160,
            margin: 1,
            color: {
              dark: "var(--color-primary)",
              light: "var(--color-surface)",
            },
            errorCorrectionLevel: "M",
          },
          (err) => {
            if (err) console.error("Error generating QR code", err);
          },
        );
      }
      if (previewCanvasRef.current) {
        QRCode.toCanvas(
          previewCanvasRef.current,
          qrUrl,
          {
            width: 120,
            margin: 1,
            color: {
              dark: "var(--color-primary)",
              light: "var(--color-surface)",
            },
            errorCorrectionLevel: "M",
          },
          (err) => {
            if (err) console.error("Error generating preview QR code", err);
          },
        );
      }
    }
  }, [slug, utmSource, activeCard, channelsStatus.qr]);

  // Handle Copy URL
  const copyToClipboard = async (text: string, description: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${description} copied to clipboard!`, {
        icon: "📋",
      });
    } catch {
      toast.error("Failed to copy link");
    }
  };

  // Download QR Code PNG
  const downloadQRCodePng = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `bookingbase-qr-${slug}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    toast.success("QR Code downloaded!", { icon: "⬇️" });
  };

  // Scroll handler for slider cards
  const scrollSlider = (direction: "left" | "right") => {
    if (sliderTrackRef.current) {
      const scrollAmt = direction === "left" ? -170 : 170;
      sliderTrackRef.current.scrollBy({ left: scrollAmt, behavior: "smooth" });
    }
  };

  // Embed widgets HTML snippets code
  const getEmbedCode = () => {
    return `<!-- Bookingbase widget · ${embedVariant} -->\n<script src="https://bookingbase.com/widget.js?b=${slug}&v=${embedVariant}" async></script>\n<div id="bookingbase-widget"></div>`;
  };

  return (
    <RepeatReveal
      id="channels"
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-background border-t border-border"
    >
      <div className="mx-auto w-full max-w-landing px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <span
            className="text-xs font-bold uppercase tracking-wider block"
            style={{ color: hexColor }}
          >
            Booking Channels
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-[38px] font-extrabold tracking-tight text-foreground leading-tight">
            Publish once. Take bookings from every channel.
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mx-auto leading-relaxed">
            Share one branded booking link across your website, social bios, QR
            codes and direct messages so customers can book wherever they find
            you.
          </p>
        </div>

        {/* Responsive Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* LEFT COLUMN: Controls, Selector Track, Active Config Card, Analytics */}
          <div className="lg:col-span-7 flex flex-col space-y-5 w-full">
            {/* 1. Topbar: Business Name Input */}
            <div className="flex items-center gap-3 p-3 bg-surface border border-border rounded-xl shadow-sm">
              <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider shrink-0 select-none">
                Business
              </span>
              <input
                type="text"
                value={customBusinessName}
                onChange={(e) => setCustomBusinessName?.(e.target.value)}
                maxLength={24}
                className="flex-1 px-3 py-1.5 border border-border rounded-lg text-xs font-medium focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 bg-primary"
                style={
                  {
                    "--tw-ring-color": withColorAlpha(hexColor, "1f"),
                    borderColor: withColorAlpha(hexColor, "30"),
                  } as React.CSSProperties
                }
                placeholder="Business name"
              />
              <div className="hidden sm:block text-[11px] font-mono text-muted-foreground px-3 py-1.5 bg-surface border border-border rounded-lg max-w-[280px] truncate select-none">
                bookingbase.com/
                <strong style={{ color: hexColor }}>{slug}</strong>
              </div>
            </div>

            {/* 2. Channels Carousel / Slider Track */}
            <div className="relative bg-surface border border-border rounded-xl p-3 shadow-sm select-none">
              {/* Scroll buttons */}
              <button
                type="button"
                onClick={() => scrollSlider("left")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-border bg-surface hover:bg-background hover:text-foreground text-muted-foreground flex items-center justify-center cursor-pointer transition z-10 shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Slider Track */}
              <div
                ref={sliderTrackRef}
                className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-none px-7 py-1"
              >
                {[
                  {
                    id: "url" as ChannelType,
                    label: "Direct link",
                    sub: "URL + UTM",
                    icon: LinkIcon,
                    status: "Active",
                  },
                  {
                    id: "qr" as ChannelType,
                    label: "QR code",
                    sub: "Print · Scan",
                    icon: QrCode,
                    status: "Ready",
                  },
                  {
                    id: "embed" as ChannelType,
                    label: "Embed widget",
                    sub: "HTML · React",
                    icon: Code2,
                    status: "Active",
                  },
                  {
                    id: "social" as ChannelType,
                    label: "Social bios",
                    sub: "IG · TikTok",
                    icon: Share2,
                    status: "Active",
                  },
                ].map((item) => {
                  const isSelected = activeCard === item.id;
                  const isEnabled = channelsStatus[item.id];
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveCard(item.id)}
                      className={`flex-shrink-0 w-[140px] rounded-lg border p-3 flex flex-col justify-between h-[105px] transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-surface shadow-md"
                          : "border-border hover:border-foreground bg-primary"
                      } ${!isEnabled ? "opacity-50" : ""}`}
                      style={{
                        borderColor: isSelected ? hexColor : undefined,
                        borderTopWidth: isSelected ? "3px" : "1px",
                        borderTopColor: isSelected ? hexColor : undefined,
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div
                          className="w-7 h-7 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: isSelected
                              ? withColorAlpha(hexColor, "14")
                              : "color-mix(in srgb, var(--color-muted-foreground) 8%, transparent)",
                            color: isSelected
                              ? hexColor
                              : "var(--color-primary)",
                          }}
                        >
                          <Icon className="w-3.5 h-3.5" />
                        </div>

                        {/* Status pill toggler inside slider card */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChannelsStatus((prev) => ({
                              ...prev,
                              [item.id]: !prev[item.id],
                            }));
                            toast.success(
                              `${item.label} channel ${
                                !channelsStatus[item.id]
                                  ? "enabled"
                                  : "disabled"
                              }`,
                              { icon: !channelsStatus[item.id] ? "✓" : "⏸" },
                            );
                          }}
                          className={`text-[8.5px] font-bold px-2 py-0.5 rounded-full border cursor-pointer select-none transition ${
                            isEnabled
                              ? "bg-success-surface text-success-surface-foreground border-success-border"
                              : "bg-neutral-100 text-neutral-500 border-neutral-200"
                          }`}
                        >
                          <span
                            className={`inline-block w-1 h-1 rounded-full mr-1 ${
                              isEnabled ? "bg-success-500" : "bg-neutral-400"
                            }`}
                          />
                          {isEnabled ? item.status : "Off"}
                        </button>
                      </div>
                      <div className="text-left mt-2">
                        <span className="text-[12px] font-bold text-foreground block leading-tight">
                          {item.label}
                        </span>
                        <span className="text-[8.5px] text-muted-foreground font-bold block uppercase tracking-wide mt-0.5">
                          {item.sub}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => scrollSlider("right")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full border border-border bg-surface hover:bg-background hover:text-foreground text-muted-foreground flex items-center justify-center cursor-pointer transition z-10 shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* 3. Active Configuration Card (with Framer Motion swap animation) */}
            <div className="bg-surface border border-border rounded-xl p-5 shadow-sm text-left relative min-h-[290px] flex flex-col justify-between">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCard}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-4 flex-1 flex flex-col justify-between w-full"
                >
                  {/* Active Card Header */}
                  <div className="w-full">
                    <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{
                            backgroundColor: withColorAlpha(hexColor, "14"),
                            color: hexColor,
                          }}
                        >
                          {activeCard === "url" && (
                            <LinkIcon className="w-4 h-4" />
                          )}
                          {activeCard === "qr" && (
                            <QrCode className="w-4 h-4" />
                          )}
                          {activeCard === "embed" && (
                            <Code2 className="w-4 h-4" />
                          )}
                          {activeCard === "social" && (
                            <Share2 className="w-4 h-4" />
                          )}
                        </div>
                        <h3 className="text-sm font-bold text-foreground leading-tight">
                          {activeCard === "url" && "Direct booking link"}
                          {activeCard === "qr" && "Instant QR code"}
                          {activeCard === "embed" && "Website embed widget"}
                          {activeCard === "social" && "Social media bios"}
                        </h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setChannelsStatus((prev) => ({
                            ...prev,
                            [activeCard]: !prev[activeCard],
                          }));
                        }}
                        className={`text-[9.5px] font-extrabold px-3 py-1 rounded-full border cursor-pointer select-none transition ${
                          channelsStatus[activeCard]
                            ? "bg-success-surface text-success-surface-foreground border-success-border"
                            : "bg-neutral-100 text-neutral-500 border-neutral-200"
                        }`}
                      >
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${
                            channelsStatus[activeCard]
                              ? "bg-success-500 animate-pulse"
                              : "bg-neutral-400"
                          }`}
                        />
                        {channelsStatus[activeCard]
                          ? activeCard === "qr"
                            ? "Ready"
                            : "Active"
                          : "Off"}
                      </button>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {activeCard === "url" &&
                        "Share a branded booking URL in messages, emails, ads or customer follow-ups."}
                      {activeCard === "qr" &&
                        "Print a QR code for your storefront, counter, flyers or business cards."}
                      {activeCard === "embed" &&
                        "Add a booking button, calendar widget or overlay to your existing website."}
                      {activeCard === "social" &&
                        "Add your booking link to Instagram, TikTok, Facebook, Google Business or WhatsApp."}
                    </p>
                  </div>

                  {/* Dynamic Inner Panel Body */}
                  <div className="flex-1 py-3">
                    {/* DIRECT LINK CONFIG */}
                    {activeCard === "url" && (
                      <div className="space-y-3.5">
                        <div className="flex items-center gap-2.5 bg-background border border-border rounded-lg p-2.5 text-xs font-mono text-foreground select-none">
                          <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate flex-grow">
                            bookingbase.com/
                            <strong style={{ color: hexColor }}>{slug}</strong>
                            {utmSource
                              ? `?utm_source=${utmSource}&utm_medium=social&utm_campaign=booking`
                              : ""}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                            Track source (UTM source tag)
                          </label>
                          <select
                            value={utmSource}
                            onChange={(e) => {
                              setUtmSource(e.target.value);
                              if (e.target.value) {
                                toast.info(
                                  `Source tracking tagged: ${e.target.value}`,
                                  { icon: "🏷️" },
                                );
                              }
                            }}
                            className="w-full px-3 py-2 border border-border rounded-lg text-xs bg-surface text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus:border-primary"
                          >
                            <option value="">
                              — No UTM tag (direct link) —
                            </option>
                            {[
                              "instagram",
                              "tiktok",
                              "facebook",
                              "whatsapp",
                              "email",
                              "google",
                              "flyer",
                            ].map((opt) => (
                              <option key={opt} value={opt}>
                                {opt.charAt(0).toUpperCase() + opt.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    {/* QR CODE CONFIG */}
                    <div
                      className={
                        activeCard === "qr"
                          ? "flex flex-col items-center py-2 space-y-4"
                          : "hidden"
                      }
                    >
                      <div className="p-3.5 border border-border rounded-xl bg-surface shadow-sm flex flex-col items-center">
                        <canvas
                          ref={canvasRef}
                          className="w-[160px] h-[160px]"
                        />
                        <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider mt-2.5">
                          Scan to book
                        </span>
                      </div>
                    </div>

                    {/* EMBED WIDGET CONFIG */}
                    {activeCard === "embed" && (
                      <div className="space-y-4">
                        {/* Tabs */}
                        <div className="flex gap-1.5 p-1 bg-background border border-border/60 rounded-xl">
                          {(
                            [
                              "calendar",
                              "button",
                              "overlay",
                            ] as EmbedVariantType[]
                          ).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setEmbedVariant(v)}
                              className={`flex-1 py-2 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                                embedVariant === v
                                  ? "bg-surface text-foreground shadow-sm"
                                  : "text-muted-foreground hover:text-foreground bg-transparent"
                              }`}
                            >
                              {v === "calendar" && "📅 Calendar"}
                              {v === "button" && "🔘 Button"}
                              {v === "overlay" && "💬 Overlay"}
                            </button>
                          ))}
                        </div>

                        {/* Interactive Widget Stage */}
                        <div className="border border-border rounded-xl p-4 bg-background/40 min-h-[160px] flex flex-col justify-center items-center select-none overflow-hidden relative">
                          {/* Calendar Variant Stage */}
                          {embedVariant === "calendar" && (
                            <div className="w-full max-w-[280px] bg-surface border border-border rounded-lg p-3 shadow-sm space-y-3">
                              {/* Browser Bar */}
                              <div className="flex gap-1 border-b border-border/50 pb-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                              </div>
                              <span className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                                Pick a time
                              </span>
                              <div className="grid grid-cols-5 gap-1.5">
                                {["Mon", "Tue", "Wed", "Thu", "Fri"].map(
                                  (day, idx) => {
                                    const isHot = idx === 1 || idx === 4;
                                    return (
                                      <div
                                        key={day}
                                        onClick={() => {
                                          if (isHot) {
                                            toast.success(
                                              `Mock slot selected for ${day}!`,
                                              { icon: "🕒" },
                                            );
                                          }
                                        }}
                                        className={`py-2 px-1 text-center rounded border text-[9.5px] font-bold cursor-pointer transition ${
                                          isHot
                                            ? "text-primary-foreground hover:opacity-90"
                                            : "border-border text-muted-foreground bg-primary"
                                        }`}
                                        style={{
                                          backgroundColor: isHot
                                            ? hexColor
                                            : undefined,
                                          borderColor: isHot
                                            ? hexColor
                                            : undefined,
                                        }}
                                      >
                                        {day}
                                      </div>
                                    );
                                  },
                                )}
                              </div>
                              <div className="text-[9.5px] text-foreground">
                                Available slot: <strong>9:00 AM</strong>
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  toast.success(
                                    "Simulated booking submitted!",
                                    { icon: "🎉" },
                                  )
                                }
                                className="w-full py-2 text-primary-foreground text-[10.5px] font-bold rounded-md hover:translate-y-[-1px] transition shadow-sm cursor-pointer"
                                style={{ backgroundColor: hexColor }}
                              >
                                Book slot →
                              </button>
                            </div>
                          )}

                          {/* Button Variant Stage */}
                          {embedVariant === "button" && (
                            <div className="flex flex-col items-center justify-center space-y-3 w-full py-4 bg-surface border border-border rounded-lg max-w-[280px] p-4 shadow-sm text-center">
                              <div className="h-2 w-2/3 bg-border rounded" />
                              <div className="h-1.5 w-4/5 bg-border/60 rounded" />
                              <button
                                type="button"
                                onClick={() =>
                                  toast.success(
                                    "Mock booking overlay opened!",
                                    { icon: "💻" },
                                  )
                                }
                                className="px-5 py-2 text-primary-foreground text-xs font-bold rounded-full cursor-pointer hover:scale-105 active:scale-95 transition-all shadow"
                                style={{ backgroundColor: hexColor }}
                              >
                                📅 Book now
                              </button>
                              <span className="text-[9px] text-muted-foreground font-medium">
                                Pop-up booking widget triggers on click
                              </span>
                            </div>
                          )}

                          {/* Overlay Variant Stage */}
                          {embedVariant === "overlay" && (
                            <div className="w-full max-w-[280px] bg-surface border border-border rounded-lg p-3.5 shadow-sm min-h-[120px] flex flex-col justify-between relative">
                              <div className="space-y-1.5">
                                <div className="h-2 w-1/3 bg-border rounded" />
                                <div className="h-1.5 w-full bg-border/50 rounded" />
                                <div className="h-1.5 w-5/6 bg-border/50 rounded" />
                              </div>

                              {/* Pulsing Floating Overlay Badge */}
                              <div
                                onClick={() =>
                                  toast.success(
                                    "Simulated widget sliding drawer opened!",
                                    { icon: "📈" },
                                  )
                                }
                                className="absolute bottom-2.5 right-2.5 px-3 py-1.5 text-primary-foreground text-[9.5px] font-extrabold rounded-lg shadow-md cursor-pointer animate-pulse hover:scale-105 transition-transform flex items-center gap-1"
                                style={{ backgroundColor: hexColor }}
                              >
                                <CalendarIcon className="w-3 h-3" />
                                <span>Book — 1 click</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* SOCIAL BIOS CONFIG */}
                    {activeCard === "social" && (
                      <div className="space-y-4">
                        {/* Bio Simulated Card */}
                        <div className="bg-surface border border-border rounded-xl p-4 shadow-sm space-y-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full shrink-0 bg-gradient-to-tr from-warning-500 via-danger-500 to-info-500 p-0.5">
                              <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xs font-extrabold uppercase text-neutral-700 select-none">
                                {slug.slice(0, 2)}
                              </div>
                            </div>
                            <div>
                              <strong className="text-xs text-foreground block">
                                @{slug}.wellness
                              </strong>
                              <span className="text-[10px] text-muted-foreground leading-none">
                                Massage & Wellness Studio • Brooklyn
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-foreground leading-relaxed">
                            💆 Hot stone • Deep tissue • Reiki <br />
                            📍 247 Bedford Ave, Brooklyn <br />
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold font-mono tracking-tight mt-1 select-none border"
                              style={{
                                color: hexColor,
                                backgroundColor: withColorAlpha(hexColor, "08"),
                                borderColor: withColorAlpha(hexColor, "15"),
                              }}
                            >
                              🔗 bookingbase.com/{slug}
                            </span>
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              toast.success(
                                "Mock Instagram profile page opened!",
                                { icon: "📸" },
                              )
                            }
                            className="flex-1 py-2 px-3 border border-border hover:border-foreground text-foreground hover:text-foreground text-[10.5px] font-bold rounded-full bg-surface cursor-pointer active:scale-95 transition"
                          >
                            📷 Instagram
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const waUrl = `https://wa.me/?text=${encodeURIComponent(
                                `Book your appointment: https://bookingbase.com/${slug}?utm_source=whatsapp`,
                              )}`;
                              window.open(waUrl, "_blank");
                            }}
                            className="flex-1 py-2 px-3 border border-border hover:border-foreground text-foreground hover:text-foreground text-[10.5px] font-bold rounded-full bg-surface cursor-pointer active:scale-95 transition"
                          >
                            💬 WhatsApp
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Config Bottom Action Button */}
                  <div className="pt-4 border-t border-border/60 w-full">
                    {activeCard === "url" && (
                      <button
                        type="button"
                        onClick={() => {
                          const trackedLink = `https://bookingbase.com/${slug}${
                            utmSource
                              ? `?utm_source=${utmSource}&utm_medium=social&utm_campaign=booking`
                              : ""
                          }`;
                          copyToClipboard(
                            trackedLink,
                            utmSource
                              ? `Tracked UTM link (${utmSource})`
                              : "Direct booking link",
                          );
                        }}
                        className="w-full py-3 text-primary-foreground text-xs font-bold rounded-full shadow-sm cursor-pointer active:scale-[0.98] hover:translate-y-[-1px] transition duration-150 flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: hexColor }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy tracked link
                      </button>
                    )}

                    {activeCard === "qr" && (
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={downloadQRCodePng}
                          className="py-2.5 px-3 border border-border hover:border-foreground text-foreground hover:text-foreground text-[11px] font-bold rounded-full bg-surface cursor-pointer active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Download PNG
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            toast.success(
                              "Printable PDF generated successfully!",
                              { icon: "🖨️" },
                            )
                          }
                          className="py-2.5 px-3 border border-border hover:border-foreground text-foreground hover:text-foreground text-[11px] font-bold rounded-full bg-surface cursor-pointer active:scale-[0.98] transition flex items-center justify-center gap-1.5"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          Print PDF
                        </button>
                      </div>
                    )}

                    {activeCard === "embed" && (
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(
                            getEmbedCode(),
                            `${embedVariant} embed code`,
                          )
                        }
                        className="w-full py-3 text-primary-foreground text-xs font-bold rounded-full shadow-sm cursor-pointer active:scale-[0.98] hover:translate-y-[-1px] transition duration-150 flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: hexColor }}
                      >
                        <Code2 className="w-3.5 h-3.5" />
                        Copy embed code
                      </button>
                    )}

                    {activeCard === "social" && (
                      <button
                        type="button"
                        onClick={() =>
                          copyToClipboard(`bookingbase.com/${slug}`, "Bio link")
                        }
                        className="w-full py-3 text-primary-foreground text-xs font-bold rounded-full shadow-sm cursor-pointer active:scale-[0.98] hover:translate-y-[-1px] transition duration-150 flex items-center justify-center gap-1.5"
                        style={{ backgroundColor: hexColor }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                        Copy bio link
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* 4. Analytics Block (Counter animation) */}
            <div className="bg-surface border border-border rounded-xl p-4 md:p-5 shadow-sm grid grid-cols-3 gap-4 items-center select-none">
              <div className="text-left border-r border-border/80 pr-4">
                <div className="text-xl md:text-2xl font-black text-foreground flex items-baseline tracking-tight">
                  <span>{animatedClicks}</span>
                  <span className="text-[10px] font-extrabold text-primary bg-primary border border-success-border px-1.5 py-0.5 rounded ml-1.5">
                    +18%
                  </span>
                </div>
                <div className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider mt-1 leading-none">
                  Link clicks
                </div>
              </div>

              <div className="text-left border-r border-border/80 pr-4">
                <div className="text-xl md:text-2xl font-black text-foreground flex items-baseline tracking-tight">
                  <span>{animatedBookings}</span>
                  <span className="text-[10px] font-extrabold text-primary bg-primary border border-success-border px-1.5 py-0.5 rounded ml-1.5">
                    +9%
                  </span>
                </div>
                <div className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider mt-1 leading-none">
                  Bookings
                </div>
              </div>

              <div className="text-left pl-1">
                <div className="text-[9px] text-muted-foreground font-extrabold uppercase tracking-wider leading-none mb-1.5">
                  Stats Range
                </div>
                <div className="flex gap-1 p-0.5 bg-background border border-border/60 rounded-lg">
                  {([7, 30, 90] as const).map((range) => (
                    <button
                      key={range}
                      type="button"
                      onClick={() => setSelectedRange(range)}
                      className={`flex-1 py-1 text-[9.5px] font-extrabold rounded transition-all cursor-pointer ${
                        selectedRange === range
                          ? "bg-surface text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {range}d
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Browser mockup live preview of what customers see */}
          <div className="lg:col-span-5 order-1 lg:order-2 flex flex-col space-y-4 w-full relative">
            <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-success-500 shadow-md animate-ping" />
              LIVE PREVIEW • WHAT CUSTOMERS SEE
            </span>

            {/* Simulated Desktop Browser Frame */}
            <div className="w-full bg-surface border border-border rounded-xl shadow-2xl overflow-hidden select-none flex flex-col h-[520px]">
              {/* Browser Header Bar */}
              <div className="flex items-center justify-between p-3 border-b border-border/60 bg-background shrink-0">
                <div className="flex items-center gap-1.5 w-16">
                  <div className="w-3 h-3 rounded-full bg-danger-400 border border-neutral-950/10" />
                  <div className="w-3 h-3 rounded-full bg-warning-400 border border-neutral-950/10" />
                  <div className="w-3 h-3 rounded-full bg-success-400 border border-neutral-950/10" />
                </div>
                <div className="bg-surface text-[9px] font-mono text-muted-foreground px-4 py-1.5 rounded-md border border-border w-full max-w-xs truncate text-center shadow-sm">
                  {activeCard === "social" ? (
                    <>
                      instagram.com/
                      <strong className="text-foreground font-bold">
                        {slug}.wellness
                      </strong>
                    </>
                  ) : activeCard === "embed" ? (
                    <strong className="text-foreground font-bold">
                      {slug}wellness.com
                    </strong>
                  ) : (
                    <>
                      bookingbase.com/
                      <strong className="text-foreground font-bold">
                        {slug}
                      </strong>
                      {activeCard === "url" &&
                        utmSource &&
                        `?utm_source=${utmSource}`}
                    </>
                  )}
                </div>
                <div className="w-16" />
              </div>

              {/* Mock Web Content */}
              <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:hidden bg-primary p-4 relative flex flex-col">
                {/* 1. DIRECT LINK PREVIEW (Standard Customer Booking Page) */}
                {activeCard === "url" && (
                  <div className="space-y-4 flex flex-col justify-between flex-grow">
                    <div className="space-y-4">
                      {/* Mock Branding Header inside Mockup */}
                      <div className="flex justify-between items-center pb-3 border-b border-border/40">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-primary-foreground text-xs font-black shadow-sm shrink-0"
                            style={{ backgroundColor: hexColor }}
                          >
                            {customBusinessName && customBusinessName[0]
                              ? customBusinessName[0].toUpperCase()
                              : "B"}
                          </div>
                          <h4 className="text-[11px] font-extrabold text-foreground truncate max-w-[120px]">
                            {customBusinessName || "Lumière"}
                          </h4>
                        </div>
                        <div className="flex gap-2.5 text-[8.5px] font-bold text-muted-foreground">
                          <span>Services</span>
                          <span>Reviews</span>
                        </div>
                      </div>

                      {/* Trust Badges in Mockup */}
                      <div className="flex items-center justify-center gap-3 text-[8.5px] font-extrabold text-success-surface-foreground bg-success-surface/50 border border-success-border/50 py-1.5 px-3 rounded-full max-w-[260px] mx-auto">
                        <span className="flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 shrink-0" />
                          Instant Confirmation
                        </span>
                        <span className="w-1 h-1 rounded-full bg-success-400" />
                        <span className="flex items-center gap-0.5">
                          <Check className="w-2.5 h-2.5 shrink-0" />
                          Secure Deposit
                        </span>
                      </div>

                      {/* Simulated Booking Form Card */}
                      <div className="bg-surface border border-border rounded-xl p-3.5 shadow-sm space-y-3.5">
                        {/* Step 1: Service */}
                        <div className="text-left">
                          <span className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            1. Select service
                          </span>
                          <div className="border border-border rounded-lg p-2.5 bg-surface">
                            <div className="flex justify-between items-center">
                              <div>
                                <strong className="text-[10px] text-foreground block font-bold">
                                  Signature Hot Stone Session
                                </strong>
                                <span className="text-[8.5px] text-muted-foreground mt-0.5 block leading-none">
                                  65 mins • Personal Care
                                </span>
                              </div>
                              <span
                                className="text-[10.5px] font-extrabold"
                                style={{ color: hexColor }}
                              >
                                $75.00
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Step 2: Specialists selectors */}
                        <div className="text-left">
                          <span className="text-[8px] font-extrabold text-muted-foreground uppercase tracking-wider block mb-1.5">
                            2. Choose specialist
                          </span>
                          <div className="grid grid-cols-2 gap-2">
                            {[
                              {
                                id: "EC",
                                name: "Emily Cooper",
                                bg: "var(--color-primary)",
                              },
                              {
                                id: "SJ",
                                name: "Sarah Jennings",
                                bg: "var(--color-primary)",
                              },
                            ].map((sp) => {
                              const isSel = selectedSpecialist === sp.id;
                              return (
                                <div
                                  key={sp.id}
                                  onClick={() =>
                                    setSelectedSpecialist(sp.id as "EC" | "SJ")
                                  }
                                  className={`p-2 rounded-lg border text-left flex items-center justify-between cursor-pointer transition ${
                                    isSel
                                      ? "bg-background"
                                      : "hover:border-muted-foreground bg-surface border-border"
                                  }`}
                                  style={{
                                    borderColor: isSel ? hexColor : undefined,
                                  }}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div
                                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-primary-foreground shrink-0"
                                      style={{
                                        backgroundColor: isSel
                                          ? hexColor
                                          : sp.bg,
                                      }}
                                    >
                                      {sp.id}
                                    </div>
                                    <span className="text-[9.5px] font-bold text-foreground truncate">
                                      {sp.name}
                                    </span>
                                  </div>
                                  {isSel && (
                                    <Check
                                      className="w-3 h-3 shrink-0"
                                      style={{ color: hexColor }}
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Booking CTA Button */}
                        <button
                          type="button"
                          onClick={() => {
                            toast.success(
                              "Simulated booking successful! Toast trigger sim.",
                              { icon: "🚀" },
                            );
                            setShowSMS(false);
                            setTimeout(() => setShowSMS(true), 250);
                          }}
                          className="w-full py-2.5 text-primary-foreground text-[10px] font-bold rounded-full shadow hover:opacity-95 transition cursor-pointer"
                          style={{ backgroundColor: hexColor }}
                        >
                          Book & Pay Deposit ($15.00)
                        </button>

                        <span className="text-[8.5px] font-extrabold text-success-surface-foreground block text-center leading-none">
                          ✓ Secure online deposit
                        </span>
                      </div>
                    </div>

                    {/* SMS simulated confirmation receipt */}
                    <AnimatePresence>
                      {showSMS && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: 10 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0, y: 10 }}
                          className="border border-border rounded-xl p-3.5 bg-surface shadow-sm flex gap-2.5 items-start overflow-hidden text-left"
                        >
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: withColorAlpha(hexColor, "14"),
                              color: hexColor,
                            }}
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-center leading-none">
                              <span className="text-[8.5px] font-extrabold text-foreground uppercase tracking-wider">
                                SMS reminder preview
                              </span>
                              <span className="text-[8px] text-muted-foreground">
                                Just now
                              </span>
                            </div>
                            <p className="text-[10px] text-foreground leading-snug">
                              Hi Alex, your appointment at{" "}
                              <strong className="text-foreground font-bold">
                                {customBusinessName || "Lumière"}
                              </strong>{" "}
                              is confirmed. We&apos;ll text you 24h before.
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* 2. QR CODE PREVIEW (Storefront Acrylic Table Stand) */}
                {activeCard === "qr" && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center select-none">
                    <div className="bg-surface border-[6px] border-neutral-900 rounded-xl p-6 shadow-2xl max-w-[200px] w-full flex flex-col items-center space-y-4 relative">
                      <div className="w-3 h-3 rounded-full bg-neutral-900 absolute -top-1.5 shadow" />
                      <span
                        className="text-[10px] font-black uppercase tracking-wider block"
                        style={{ color: hexColor }}
                      >
                        {customBusinessName || "Lumière"}
                      </span>
                      <div className="p-1.5 border border-border rounded bg-primary">
                        <canvas
                          ref={previewCanvasRef}
                          className="w-[120px] h-[120px]"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] font-extrabold text-foreground uppercase tracking-wide block">
                          Scan to Book
                        </span>
                        <span className="text-[8px] font-medium text-muted-foreground block leading-none">
                          Storefront Stand Mockup
                        </span>
                      </div>
                    </div>
                    <span className="text-[9.5px] font-bold text-muted-foreground mt-5 block">
                      Customers scan the code at your shop to book instantly.
                    </span>
                  </div>
                )}

                {/* 3. EMBED WIDGET PREVIEW (Custom Website Integration) */}
                {activeCard === "embed" && (
                  <div className="flex-grow flex flex-col bg-surface rounded-xl border border-border shadow-sm text-left overflow-hidden relative">
                    {/* Mock Website Nav */}
                    <div className="flex justify-between items-center px-3 py-2 border-b border-border bg-primary shrink-0">
                      <span className="text-[9px] font-black text-foreground uppercase tracking-tight">
                        {customBusinessName || "Lumière"} Wellness
                      </span>
                      <div className="flex gap-2.5 text-[8px] font-bold text-muted-foreground">
                        <span>Services</span>
                        <span>About</span>
                        <span>Contact</span>
                      </div>
                    </div>

                    {/* Mock Website Body */}
                    <div className="p-4 flex-grow relative space-y-4">
                      <div className="space-y-1.5">
                        <div className="inline-block px-2 py-0.5 text-[8.5px] font-extrabold rounded-full bg-accent text-accent-foreground border border-primary-200">
                          {embedVariant.toUpperCase()} WIDGET EMBEDDED
                        </div>
                        <h5 className="text-xs font-black text-foreground leading-tight">
                          Holistic Wellness & Bodywork
                        </h5>
                        <p className="text-[9.5px] text-muted-foreground leading-relaxed">
                          We provide premium, customizable clinical massage and
                          skincare solutions. Adjusting schedules to fit yours.
                        </p>
                      </div>

                      {/* Dynamic Widget Embed Demonstration */}
                      {embedVariant === "calendar" && (
                        <div className="border border-border rounded-lg p-3 bg-primary shadow-inner space-y-2.5 max-w-[250px]">
                          <span className="text-[8.5px] font-extrabold text-muted-foreground uppercase tracking-wider block">
                            Direct Scheduler Widget
                          </span>
                          <div className="grid grid-cols-5 gap-1.5 text-center">
                            {["M", "T", "W", "T", "F"].map((d, i) => (
                              <span
                                key={i}
                                className={`py-1 text-[8.5px] font-bold rounded ${
                                  i === 1 || i === 4
                                    ? "text-primary-foreground"
                                    : "bg-surface text-muted-foreground border border-border/80"
                                }`}
                                style={{
                                  backgroundColor:
                                    i === 1 || i === 4 ? hexColor : undefined,
                                }}
                              >
                                {d}
                              </span>
                            ))}
                          </div>
                          <button
                            type="button"
                            className="w-full py-1.5 text-primary-foreground text-[9.5px] font-bold rounded shadow-sm"
                            style={{ backgroundColor: hexColor }}
                          >
                            📅 Book a slot
                          </button>
                        </div>
                      )}

                      {embedVariant === "button" && (
                        <div className="py-2">
                          <button
                            type="button"
                            className="px-4.5 py-2 text-primary-foreground text-[10px] font-bold rounded-full shadow hover:scale-105 active:scale-95 transition flex items-center gap-1.5"
                            style={{ backgroundColor: hexColor }}
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                            Book Appointment
                          </button>
                        </div>
                      )}

                      {embedVariant === "overlay" && (
                        <div className="absolute bottom-3 right-3">
                          <div
                            className="w-9 h-9 rounded-full shadow-lg flex items-center justify-center text-primary-foreground cursor-pointer animate-bounce"
                            style={{ backgroundColor: hexColor }}
                          >
                            <CalendarIcon className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 4. SOCIAL BIOS PREVIEW (Instagram Mobile Profile Screen Mockup) */}
                {activeCard === "social" && (
                  <div className="flex-grow bg-surface rounded-xl border border-border shadow-sm text-left overflow-hidden flex flex-col">
                    {/* Instagram Mobile Top */}
                    <div className="flex justify-between items-center px-3.5 py-2.5 border-b border-border bg-primary shrink-0 select-none">
                      <span className="text-[9.5px] font-extrabold text-foreground">
                        @{slug}.wellness
                      </span>
                      <span className="text-[10px] text-muted-foreground font-bold font-mono">
                        •••
                      </span>
                    </div>

                    {/* Instagram Profile stats & Info */}
                    <div className="p-4 space-y-4 flex-grow flex flex-col justify-between">
                      <div className="space-y-3.5">
                        <div className="flex items-center justify-between">
                          {/* Profile Avatar */}
                          <div className="w-12 h-12 rounded-full shrink-0 bg-gradient-to-tr from-warning-500 via-danger-500 to-info-500 p-0.5 shadow-sm">
                            <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-xs font-black uppercase text-neutral-700">
                              {slug.slice(0, 2)}
                            </div>
                          </div>
                          {/* Stats */}
                          <div className="flex gap-4 text-center">
                            <div>
                              <strong className="text-[10px] text-foreground block font-bold">
                                42
                              </strong>
                              <span className="text-[8px] text-muted-foreground block uppercase tracking-wide">
                                posts
                              </span>
                            </div>
                            <div>
                              <strong className="text-[10px] text-foreground block font-bold">
                                1.8K
                              </strong>
                              <span className="text-[8px] text-muted-foreground block uppercase tracking-wide">
                                followers
                              </span>
                            </div>
                            <div>
                              <strong className="text-[10px] text-foreground block font-bold">
                                324
                              </strong>
                              <span className="text-[8px] text-muted-foreground block uppercase tracking-wide">
                                following
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Bio Text */}
                        <div className="space-y-0.5 text-left text-[9.5px] leading-snug">
                          <strong className="text-foreground font-bold block">
                            {customBusinessName || "Lumière"} Wellness Studio
                          </strong>
                          <p className="text-foreground">
                            💆 Hot stone • Deep tissue • Reiki <br />
                            📍 247 Bedford Ave, Brooklyn <br />
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                toast.success("Opening booking page link!", {
                                  icon: "🔗",
                                });
                              }}
                              className="text-info-surface-foreground font-extrabold hover:underline block mt-1"
                            >
                              bookingbase.com/{slug}
                            </a>
                          </p>
                        </div>
                      </div>

                      {/* Post Grid Placeholders */}
                      <div className="grid grid-cols-3 gap-1.5 pt-2">
                        {[...Array(3)].map((_, i) => (
                          <div
                            key={i}
                            className="aspect-square bg-gradient-to-br from-background to-surface rounded-lg border border-border flex items-center justify-center"
                          >
                            <span className="text-[8px] text-muted-foreground font-bold">
                              Post {i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom ready indicator */}
            <div className="p-3 border border-success-border bg-success-surface/50 rounded-xl text-success-surface-foreground text-xs font-bold text-center flex items-center justify-center gap-2 select-none">
              <span className="w-2 h-2 rounded-full bg-success-500 animate-ping shrink-0" />
              <span>✓ BOOKING SITE IS LIVE AND READY TO SHARE</span>
            </div>
          </div>
        </div>
      </div>
    </RepeatReveal>
  );
}
