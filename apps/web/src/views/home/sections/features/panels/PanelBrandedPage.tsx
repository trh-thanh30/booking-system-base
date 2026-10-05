"use client";

import { useState } from "react";
import { BRANDED_MOCK_SLOTS } from "../constants/features.constants";
import { COLOR_INPUT_DEFAULT } from "../../../constants/color-input.constants";

export function PanelBrandedPage() {
  const [brandName, setBrandName] = useState("Glow Salon");
  const [brandColor, setBrandColor] = useState(COLOR_INPUT_DEFAULT);
  const [brandDomain, setBrandDomain] = useState("glow-salon");

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-5 items-stretch h-full font-sans">
      {/* Settings Form */}
      <div className="flex flex-col gap-3 justify-center">
        {/* Brand name */}
        <div className="rounded-xl border border-border/80 bg-surface px-3.5 py-2.5 shadow-md">
          <label className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
            Brand name
          </label>
          <input
            type="text"
            className="w-full bg-transparent border-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 font-bold text-foreground text-xs p-0  focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value.slice(0, 20))}
            maxLength={20}
          />
        </div>

        {/* Brand color */}
        <div className="rounded-xl border border-border/80 bg-surface px-3.5 py-2.5 shadow-md">
          <label className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
            Brand color
          </label>
          <div className="flex items-center gap-2.5 mt-0.5">
            <div
              className="w-4.5 h-4.5 rounded-full border border-border shadow-sm"
              style={{ backgroundColor: brandColor }}
            />
            <input
              type="color"
              className="w-12 h-6 border-0 p-0 bg-transparent cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
            />
            <span className="font-mono text-[11px] text-foreground uppercase tracking-wider">
              {brandColor}
            </span>
          </div>
        </div>

        {/* Custom domain */}
        <div className="rounded-xl border border-border/80 bg-surface px-3.5 py-2.5 shadow-md">
          <label className="block text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground mb-1">
            Custom domain
          </label>
          <div className="flex items-center gap-1 font-mono text-xs mt-0.5">
            <span className="text-muted-foreground">booking.link/</span>
            <input
              type="text"
              className="flex-1 bg-transparent border-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 font-bold text-primary p-0  focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              value={brandDomain}
              onChange={(e) =>
                setBrandDomain(
                  e.target.value.toLowerCase().replace(/[^a-z0-h0-9-_]/g, ""),
                )
              }
            />
          </div>
        </div>

        {/* Live URL */}
        <div className="rounded-xl border border-success-border bg-success-surface/20 px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <span className="block text-[8px] font-extrabold uppercase tracking-wider text-success-surface-foreground leading-none mb-1">
              Live URL Status
            </span>
            <span className="font-mono text-[11px] text-success-surface-foreground font-bold break-all">
              booking.link/{brandDomain || "your-brand"}
            </span>
          </div>
          <span className="inline-flex h-2 w-2 rounded-full bg-success-500 animate-pulse shrink-0 ml-2" />
        </div>
      </div>

      {/* Mobile Mockup */}
      <div className="flex items-center justify-center p-2">
        <div className="w-[195px] rounded-[1.8rem] border-[6px] border-neutral-900 bg-surface shadow-md overflow-hidden relative transition-all duration-300 ring-1 ring-neutral-200">
          {/* Speaker / Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-neutral-900 rounded-b-lg z-20" />

          {/* Screen */}
          <div
            className="p-4 pt-7 min-h-[245px] flex flex-col gap-2.5 text-primary-foreground transition-colors duration-500 relative"
            style={{ backgroundColor: brandColor }}
          >
            {/* White overlay to make content readable for lighter background colors */}
            <div className="absolute inset-0 bg-neutral-950/[0.04] pointer-events-none" />

            {/* Logo */}
            <div
              className="w-8 h-8 rounded-lg bg-surface flex items-center justify-center font-extrabold text-[14px] shadow-sm select-none transition-colors duration-500"
              style={{ color: brandColor }}
            >
              {(brandName[0] || "G").toUpperCase()}
            </div>

            {/* Brand text */}
            <p className="font-bold text-xs tracking-tight text-primary-foreground/95">
              {brandName || "Brand"}
            </p>

            {/* Sub-heading */}
            <h4 className="text-[14px] font-extrabold leading-tight tracking-tight mt-1 text-primary-foreground">
              Book your appointment
            </h4>

            {/* Time slots */}
            <div className="space-y-1.5 mt-1 select-none">
              {BRANDED_MOCK_SLOTS.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-surface/15 hover:bg-surface/20 active:scale-[0.99] border border-surface/10 rounded-lg py-1.5 px-2 text-[9.5px] font-bold text-center tracking-wide backdrop-blur-[2px] transition duration-200"
                >
                  {slot}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className="mt-2.5 w-full bg-surface py-2 rounded-full font-bold text-[10px] text-center shadow-md select-none transition duration-200 active:scale-[0.98]"
              style={{ color: brandColor }}
            >
              Choose time
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
