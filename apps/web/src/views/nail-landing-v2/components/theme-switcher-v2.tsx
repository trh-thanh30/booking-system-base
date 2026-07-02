"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, X, Check, Settings, Sparkles } from "lucide-react";
import { THEME_TEMPLATES_V2 } from "../nail-landing-v2.constants";
import type { ThemeColors } from "../nail-landing-v2.types";

// Helper to convert hex to HSL
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const cleanHex = hex.replace(/^#/, "");
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

// Helper to convert HSL to hex
function hslToHex(h: number, s: number, l: number): string {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

// Generate the 50-900 palette from a single base color (brand-500)
export function generateThemeFromHex(baseHex: string): ThemeColors {
  const { h, s, l } = hexToHsl(baseHex);

  return {
    "brand-50": hslToHex(h, Math.min(s + 5, 100), 97),
    "brand-100": hslToHex(h, Math.min(s + 5, 100), 92),
    "brand-200": hslToHex(h, s, 85),
    "brand-300": hslToHex(h, s, 74),
    "brand-400": hslToHex(h, s, 62),
    "brand-500": baseHex,
    "brand-600": hslToHex(h, s, Math.max(l - 8, 10)),
    "brand-700": hslToHex(h, s, Math.max(l - 18, 5)),
    "brand-900": hslToHex(h, s, Math.max(l - 32, 3)),
  };
}

interface ThemeSwitcherV2Props {
  currentThemeId: string;
  themeColors: ThemeColors;
  onThemeSelect: (id: string, colors: ThemeColors) => void;
}

export function ThemeSwitcherV2({
  currentThemeId,
  themeColors,
  onThemeSelect,
}: ThemeSwitcherV2Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [customColor, setCustomColor] = useState(themeColors["brand-500"]);

  useEffect(() => {
    if (currentThemeId !== "custom") {
      setCustomColor(themeColors["brand-500"]);
    }
  }, [currentThemeId, themeColors]);

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setCustomColor(hex);
    const generated = generateThemeFromHex(hex);
    onThemeSelect("custom", generated);
  };

  const cssVariables = Object.entries(themeColors)
    .map(([key, value]) => `--color-${key}: ${value} !important;`)
    .join("\n");

  return (
    <>
      {/* Inject styles dynamically to document root */}
      <style
        dangerouslySetInnerHTML={{ __html: `:root { ${cssVariables} }` }}
      />

      {/* Floating Toggle Button */}
      <div className="fixed right-6 bottom-24 md:bottom-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="w-12 h-12 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20"
          whileHover={{ rotate: 15 }}
          aria-label="Toggle theme settings"
        >
          <Palette className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Theme Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-stone-900/30 backdrop-blur-sm z-50"
            />

            {/* Sidebar Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col border-l border-stone-200/80"
            >
              {/* Header */}
              <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-stone-800">
                      Live Color Customizer
                    </h3>
                    <p className="text-[10px] text-stone-400 font-light">
                      Mock Theme database configs
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-stone-200/60 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="bg-brand-50/40 border border-brand-100/50 rounded-2xl p-4 text-xs text-brand-700 font-light leading-relaxed">
                  <strong className="font-semibold text-brand-800">
                    Mock Mode:
                  </strong>{" "}
                  This widget simulates fetching store configurations from the
                  PostgreSQL DB and injecting them dynamically as Tailwind CSS
                  v4 custom properties (`--color-brand-xxx`).
                </div>

                {/* Templates list */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-stone-400 tracking-wider">
                    Select a Template
                  </h4>
                  <div className="space-y-2">
                    {THEME_TEMPLATES_V2.map((tpl) => {
                      const isSelected = currentThemeId === tpl.id;
                      return (
                        <button
                          key={tpl.id}
                          onClick={() => {
                            onThemeSelect(tpl.id, tpl.colors);
                            setCustomColor(tpl.colors["brand-500"]);
                          }}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex justify-between items-center ${
                            isSelected
                              ? "border-brand-500 bg-brand-50/10 shadow-sm"
                              : "border-stone-200 hover:border-stone-300 bg-white"
                          }`}
                        >
                          <div className="space-y-1 pr-4">
                            <span className="text-xs font-medium text-stone-800 block">
                              {tpl.name}
                            </span>
                            <span className="text-[10px] text-stone-400 font-light block leading-normal">
                              {tpl.description}
                            </span>
                            {/* Color previews */}
                            <div className="flex gap-1.5 pt-1.5">
                              <span
                                className="w-3.5 h-3.5 rounded-full border border-stone-200/60"
                                style={{
                                  backgroundColor: tpl.colors["brand-50"],
                                }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full"
                                style={{
                                  backgroundColor: tpl.colors["brand-100"],
                                }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full"
                                style={{
                                  backgroundColor: tpl.colors["brand-500"],
                                }}
                              />
                              <span
                                className="w-3.5 h-3.5 rounded-full"
                                style={{
                                  backgroundColor: tpl.colors["brand-900"],
                                }}
                              />
                            </div>
                          </div>
                          {isSelected && (
                            <span className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center flex-shrink-0">
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Custom Color Picker */}
                <div className="border-t border-stone-100 pt-5 space-y-3">
                  <h4 className="text-xs font-semibold uppercase text-stone-400 tracking-wider flex items-center gap-1.5">
                    <Settings className="w-3.5 h-3.5 text-stone-400" />
                    Bespoke Brand Color
                  </h4>
                  <div className="bg-stone-50 border border-stone-200/60 p-4 rounded-2xl space-y-3">
                    <p className="text-[11px] text-stone-500 font-light leading-normal">
                      Drag the color picker to simulate arbitrary hex color
                      styling and watch the palette auto-generate.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-stone-200 flex-shrink-0 cursor-pointer shadow-sm bg-white">
                        <input
                          type="color"
                          value={customColor || "#000000"}
                          onChange={handleCustomColorChange}
                          className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-125 bg-transparent"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase text-stone-400 font-medium tracking-wider">
                          Primary Brand Hex
                        </span>
                        <input
                          type="text"
                          value={customColor ? customColor.toUpperCase() : ""}
                          placeholder="#000000"
                          onChange={(e) => {
                            const val = e.target.value;
                            setCustomColor(val);
                            if (/^#[0-9A-F]{6}$/i.test(val)) {
                              onThemeSelect(
                                "custom",
                                generateThemeFromHex(val),
                              );
                            }
                          }}
                          className="w-24 px-2 py-1 border border-stone-200 rounded-lg text-xs font-mono uppercase focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20 bg-white text-stone-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-stone-100 bg-stone-50 text-[10px] text-stone-400 text-center font-light leading-normal">
                Once satisfied, save the chosen JSON to your database. Under
                PostgreSQL, you can store the JSON directly!
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
