"use client";

import { useState } from "react";
import { BRANDED_MOCK_SLOTS } from "../features.constants";

export function PanelBrandedPage() {
  const [brandName, setBrandName] = useState("Glow Salon");
  const [brandColor, setBrandColor] = useState("#2563eb");
  const [brandDomain, setBrandDomain] = useState("glow-salon");

  return (
    <div className="grid grid-cols-1 md:grid-cols-[1.1fr_0.9fr] gap-5 items-stretch h-full font-sans">
      {/* Settings Form */}
      <div className="flex flex-col gap-3 justify-center">
        {/* Brand name */}
        <div className="rounded-xl border border-border-light/80 bg-bg-primary px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <label className="block text-[9px] font-extrabold uppercase tracking-wider text-text-muted mb-1">
            Brand name
          </label>
          <input
            type="text"
            className="w-full bg-transparent border-none outline-none font-bold text-text-primary text-xs p-0 focus:ring-0 focus:outline-none"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value.slice(0, 20))}
            maxLength={20}
          />
        </div>

        {/* Brand color */}
        <div className="rounded-xl border border-border-light/80 bg-bg-primary px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <label className="block text-[9px] font-extrabold uppercase tracking-wider text-text-muted mb-1">
            Brand color
          </label>
          <div className="flex items-center gap-2.5 mt-0.5">
            <div
              className="w-4.5 h-4.5 rounded-full border border-border-light shadow-sm"
              style={{ backgroundColor: brandColor }}
            />
            <input
              type="color"
              className="w-12 h-6 border-0 p-0 bg-transparent cursor-pointer rounded outline-none"
              value={brandColor}
              onChange={(e) => setBrandColor(e.target.value)}
            />
            <span className="font-mono text-[11px] text-text-secondary uppercase tracking-wider">
              {brandColor}
            </span>
          </div>
        </div>

        {/* Custom domain */}
        <div className="rounded-xl border border-border-light/80 bg-bg-primary px-3.5 py-2.5 shadow-[0_1px_3px_rgba(0,0,0,0.01)]">
          <label className="block text-[9px] font-extrabold uppercase tracking-wider text-text-muted mb-1">
            Custom domain
          </label>
          <div className="flex items-center gap-1 font-mono text-xs mt-0.5">
            <span className="text-text-muted">booking.link/</span>
            <input
              type="text"
              className="flex-1 bg-transparent border-none outline-none font-bold text-brand-blue p-0 focus:ring-0 focus:outline-none"
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
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/20 px-3.5 py-2.5 flex items-center justify-between">
          <div>
            <span className="block text-[8px] font-extrabold uppercase tracking-wider text-emerald-800 leading-none mb-1">
              Live URL Status
            </span>
            <span className="font-mono text-[11px] text-emerald-800 font-bold break-all">
              booking.link/{brandDomain || "your-brand"}
            </span>
          </div>
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0 ml-2" />
        </div>
      </div>

      {/* Mobile Mockup */}
      <div className="flex items-center justify-center p-2">
        <div className="w-[195px] rounded-[1.8rem] border-[6px] border-zinc-900 bg-bg-primary shadow-[0_12px_30px_rgba(0,0,0,0.08)] overflow-hidden relative transition-all duration-300 ring-1 ring-zinc-200">
          {/* Speaker / Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-3.5 bg-zinc-900 rounded-b-lg z-20" />

          {/* Screen */}
          <div
            className="p-4 pt-7 min-h-[245px] flex flex-col gap-2.5 text-white transition-colors duration-500 relative"
            style={{ backgroundColor: brandColor }}
          >
            {/* White overlay to make content readable for lighter background colors */}
            <div className="absolute inset-0 bg-black/[0.04] pointer-events-none" />

            {/* Logo */}
            <div
              className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-extrabold text-[14px] shadow-sm select-none transition-colors duration-500"
              style={{ color: brandColor }}
            >
              {(brandName[0] || "G").toUpperCase()}
            </div>

            {/* Brand text */}
            <p className="font-bold text-xs tracking-tight text-white/95">
              {brandName || "Brand"}
            </p>

            {/* Sub-heading */}
            <h4 className="text-[14px] font-extrabold leading-tight tracking-tight mt-1 text-white">
              Book your appointment
            </h4>

            {/* Time slots */}
            <div className="space-y-1.5 mt-1 select-none">
              {BRANDED_MOCK_SLOTS.map((slot, idx) => (
                <div
                  key={idx}
                  className="bg-white/15 hover:bg-white/20 active:scale-[0.99] border border-white/10 rounded-lg py-1.5 px-2 text-[9.5px] font-bold text-center tracking-wide backdrop-blur-[2px] transition duration-200"
                >
                  {slot}
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <button
              type="button"
              className="mt-2.5 w-full bg-white py-2 rounded-full font-bold text-[10px] text-center shadow-md select-none transition duration-200 active:scale-[0.98]"
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
