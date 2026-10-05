"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Menu, X } from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@repo/ui";
import { Link } from "@/src/i18n/navigation";
import { useScrollHeader } from "@/src/hooks/useScrollHeader";
import { LanguageSwitcher } from "@/src/components/common/language-switcher";
import {
  LandingContainer,
  MarketingButton,
} from "@/src/components/common/landing-compositions";
import { NAV_ITEMS } from "../constants/home.constants";

export function Header() {
  const t = useTranslations("Navigation");
  const locale = useLocale();
  const scrolled = useScrollHeader(12);
  const [mobileOpen, setMobileOpen] = useState(false);
  const loginUrl = `/${locale === "en" ? "en" : "vi"}/admin/login`;
  return (
    <header
      className={`sticky top-0 z-50 w-full border-b transition-colors duration-normal ${scrolled ? "border-border bg-surface/95 shadow-sm backdrop-blur-md" : "border-transparent bg-surface"}`}
    >
      <LandingContainer className="flex h-16 items-center justify-between gap-3">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 font-bold text-label"
          aria-label="BookingBase"
        >
          <span
            className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm"
            aria-hidden="true"
          >
            B
          </span>
          <span>
            Booking<span className="text-primary">Base</span>
          </span>
        </Link>
        <nav
          className="hidden items-center gap-1 xl:flex"
          aria-label={t("mainNavigation")}
        >
          {NAV_ITEMS.map((item) =>
            item.type === "link" ? (
              <a key={item.label} href={item.href} className="landing-nav-link">
                {item.label}
              </a>
            ) : (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="min-h-11 gap-1 px-3 text-label"
                  >
                    {item.label}
                    <ChevronDown className="size-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  className="max-h-[70dvh] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto p-2"
                >
                  {item.items?.map((sub) => (
                    <DropdownMenuItem key={sub.label} asChild>
                      <a
                        href={sub.href}
                        className="flex min-h-11 items-start gap-3 py-3"
                      >
                        <sub.icon
                          className="mt-0.5 size-4 shrink-0 text-primary"
                          aria-hidden="true"
                        />
                        <span>
                          <span className="block font-semibold">
                            {sub.label}
                          </span>
                          {"description" in sub && (
                            <span className="mt-1 block text-caption text-muted-foreground">
                              {sub.description}
                            </span>
                          )}
                        </span>
                      </a>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ),
          )}
        </nav>
        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 xl:flex">
            <LanguageSwitcher />
            <MarketingButton asChild variant="ghost">
              <a href={loginUrl}>{t("login")}</a>
            </MarketingButton>
            <MarketingButton asChild>
              <Link href="/signup-business">{t("trial")}</Link>
            </MarketingButton>
          </div>
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="size-11 xl:hidden"
                aria-label={t("openMenu")}
              >
                <Menu className="size-6" />
              </Button>
            </SheetTrigger>
            <SheetContent
              aria-describedby={undefined}
              className="w-[min(24rem,100vw)] overflow-y-auto p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <SheetTitle className="text-heading-4 font-bold">
                  BookingBase
                </SheetTitle>
                <SheetClose asChild>
                  <Button
                    variant="ghost"
                    className="size-11"
                    aria-label={t("closeMenu")}
                  >
                    <X className="size-5" />
                  </Button>
                </SheetClose>
              </div>
              <nav className="space-y-2" aria-label={t("mainNavigation")}>
                {NAV_ITEMS.map((item) =>
                  item.type === "link" ? (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="landing-nav-link block"
                    >
                      {item.label}
                    </a>
                  ) : (
                    <details
                      key={item.label}
                      className="border-b border-border py-2"
                    >
                      <summary className="min-h-11 cursor-pointer py-3 text-label font-semibold">
                        {item.label}
                      </summary>
                      <div className="space-y-1 pl-3">
                        {item.items?.map((sub) => (
                          <a
                            key={sub.label}
                            href={sub.href}
                            className="landing-nav-link flex items-center gap-3"
                            onClick={() => setMobileOpen(false)}
                          >
                            <sub.icon className="size-4" aria-hidden="true" />
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    </details>
                  ),
                )}
              </nav>
              <div className="mt-6 flex flex-col gap-3">
                <LanguageSwitcher />
                <MarketingButton asChild variant="secondary">
                  <a href={loginUrl}>{t("login")}</a>
                </MarketingButton>
                <MarketingButton asChild>
                  <Link href="/signup-business">{t("trial")}</Link>
                </MarketingButton>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </LandingContainer>
    </header>
  );
}
