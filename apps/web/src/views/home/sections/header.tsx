"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Menu, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  cn,
} from "@repo/ui";
import { Link } from "@/src/i18n/navigation";
import { useScrollHeader } from "@/src/hooks/useScrollHeader";
import { LanguageSwitcher } from "@/src/components/common/language-switcher";
import { LandingContainer } from "@/src/components/common/landing-compositions";
import { NAV_ITEMS } from "../constants/home.constants";

export function Header() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const scrolled = useScrollHeader(12);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const loginUrl = `/${locale === "en" ? "en" : "vi"}/admin/login`;

  const handleMouseEnter = (label: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setOpenMenu(label);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setOpenMenu(null);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-neutral-200/80 bg-surface/95 shadow-xs backdrop-blur-md"
          : "border-neutral-200/40 bg-surface"
      }`}
    >
      <LandingContainer className="flex h-20 items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-3 select-none group"
          aria-label="BookingBase"
        >
          <span
            className="flex size-10 sm:size-11 items-center justify-center rounded-xl bg-neutral-950 text-white font-black text-xl shadow-xs group-hover:scale-105 transition-transform"
            aria-hidden="true"
          >
            B
          </span>
          <span className="text-xl sm:text-2xl font-black tracking-tight text-neutral-950">
            Booking<span className="text-neutral-500 font-extrabold">Base</span>
          </span>
        </Link>

        {/* Center Navigation Links (Studio Style with Hover & Click Support) */}
        <nav
          className="hidden items-center gap-1.5 xl:flex"
          aria-label={t("mainNavigation")}
        >
          {NAV_ITEMS.map((item) =>
            item.type === "link" ? (
              <a
                key={item.label}
                href={item.href}
                onMouseEnter={() => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  setOpenMenu(null);
                }}
                className="px-4 py-2.5 rounded-full text-sm sm:text-base font-bold text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100 transition-all duration-150 select-none"
              >
                {item.label}
              </a>
            ) : (
              <div
                key={item.label}
                onMouseEnter={() => handleMouseEnter(item.label)}
                onMouseLeave={handleMouseLeave}
                className="relative inline-block"
              >
                <DropdownMenu
                  modal={false}
                  open={openMenu === item.label}
                  onOpenChange={(open) => {
                    if (!open && openMenu === item.label) {
                      setOpenMenu(null);
                    } else if (open) {
                      setOpenMenu(item.label);
                    }
                  }}
                >
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      onClick={() =>
                        setOpenMenu(openMenu === item.label ? null : item.label)
                      }
                      className={cn(
                        "group inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm sm:text-base font-bold transition-all duration-150 select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-neutral-950",
                        openMenu === item.label
                          ? "bg-neutral-100 text-neutral-950"
                          : "text-neutral-700 hover:text-neutral-950 hover:bg-neutral-100",
                      )}
                    >
                      <span>{item.label}</span>
                      <ChevronDown
                        className={cn(
                          "w-4 h-4 transition-transform duration-200",
                          openMenu === item.label
                            ? "rotate-180 text-neutral-950"
                            : "text-neutral-400 group-hover:text-neutral-950",
                        )}
                        aria-hidden="true"
                      />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="center"
                    sideOffset={8}
                    onMouseEnter={() => handleMouseEnter(item.label)}
                    onMouseLeave={handleMouseLeave}
                    onCloseAutoFocus={(e: Event) => e.preventDefault()}
                    className="max-h-[75dvh] w-88 max-w-[calc(100vw-2rem)] overflow-y-auto p-3 rounded-2xl border border-neutral-200 bg-surface shadow-2xl before:absolute before:-top-3 before:left-0 before:right-0 before:h-3 before:content-['']"
                  >
                    {item.items?.map((sub) => (
                      <DropdownMenuItem
                        key={sub.label}
                        asChild
                        className="rounded-xl p-3 hover:bg-neutral-50 cursor-pointer"
                        onClick={() => setOpenMenu(null)}
                      >
                        <a href={sub.href} className="flex items-start gap-3.5">
                          <div className="w-8 h-8 rounded-lg bg-neutral-100 border border-neutral-200/80 flex items-center justify-center shrink-0 mt-0.5">
                            <sub.icon
                              className="w-4 h-4 text-neutral-900"
                              aria-hidden="true"
                            />
                          </div>
                          <div>
                            <span className="block font-bold text-sm sm:text-base text-neutral-950">
                              {sub.label}
                            </span>
                            {"description" in sub && (
                              <span className="mt-0.5 block text-xs text-neutral-500 leading-snug">
                                {sub.description}
                              </span>
                            )}
                          </div>
                        </a>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ),
          )}
        </nav>

        {/* Right Action CTA Buttons */}
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-3 xl:flex">
            <LanguageSwitcher variant="landing" />
            <a
              href={loginUrl}
              className="px-5 py-2.5 h-12 inline-flex items-center justify-center rounded-full text-sm sm:text-base font-bold text-neutral-800 hover:text-neutral-950 hover:bg-neutral-100 transition-all duration-150 select-none cursor-pointer"
            >
              {t("login")}
            </a>
            <Link
              href="/signup-business"
              className="inline-flex items-center justify-center h-12 px-7 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white text-sm sm:text-base font-extrabold shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer select-none"
            >
              {t("trial")}
            </Link>
          </div>

          {/* Mobile Navigation Sheet Trigger */}
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <button
                type="button"
                className="w-12 h-12 rounded-full border border-neutral-300 hover:border-neutral-950 hover:bg-neutral-100 flex items-center justify-center text-neutral-800 xl:hidden transition-colors cursor-pointer shadow-xs"
                aria-label={t("openMenu")}
              >
                <Menu className="w-5 h-5" />
              </button>
            </SheetTrigger>
            <SheetContent
              aria-describedby={undefined}
              className="w-[min(26rem,100vw)] overflow-y-auto p-6 sm:p-8 rounded-l-3xl border-l border-neutral-200 bg-surface shadow-2xl"
            >
              <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-neutral-950 text-white font-black text-lg">
                    B
                  </span>
                  <SheetTitle className="text-2xl font-black text-neutral-950 tracking-tight">
                    BookingBase
                  </SheetTitle>
                </div>
                <SheetClose asChild>
                  <button
                    type="button"
                    className="w-10 h-10 rounded-full border border-neutral-300 hover:bg-neutral-100 flex items-center justify-center text-neutral-700 transition cursor-pointer"
                    aria-label={t("closeMenu")}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </SheetClose>
              </div>
              <nav className="space-y-3" aria-label={t("mainNavigation")}>
                {NAV_ITEMS.map((item) =>
                  item.type === "link" ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-3 rounded-2xl text-base font-bold text-neutral-900 hover:bg-neutral-100 transition-colors"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <details
                      key={item.label}
                      className="border-b border-neutral-200/80 py-3"
                    >
                      <summary className="cursor-pointer py-2 text-base font-bold text-neutral-900 flex items-center justify-between">
                        <span>{item.label}</span>
                        <ChevronDown className="w-4 h-4 text-neutral-400" />
                      </summary>
                      <div className="space-y-1.5 pl-3 pt-2">
                        {item.items?.map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            className="flex items-center gap-3 py-2 px-3 rounded-xl text-sm font-semibold text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950 transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            <sub.icon
                              className="w-4 h-4 text-neutral-800"
                              aria-hidden="true"
                            />
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    </details>
                  ),
                )}
              </nav>
              <div className="mt-8 flex flex-col gap-3.5 pt-4 border-t border-neutral-200/80">
                <LanguageSwitcher
                  variant="landing"
                  className="w-full justify-between"
                />
                <a
                  href={loginUrl}
                  className="w-full h-12 flex items-center justify-center rounded-full border border-neutral-300 text-sm font-bold text-neutral-900 hover:bg-neutral-100 transition-colors"
                >
                  {t("login")}
                </a>
                <Link
                  href="/signup-business"
                  className="w-full h-12 flex items-center justify-center rounded-full bg-neutral-950 text-white text-sm font-extrabold shadow-sm hover:bg-neutral-800 transition-colors"
                >
                  {t("trial")}
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </LandingContainer>
    </header>
  );
}
