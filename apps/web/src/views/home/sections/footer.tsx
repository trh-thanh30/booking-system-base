"use client";

import { Link } from "@/src/i18n/navigation";
import { Linkedin, Twitter, Youtube, Github } from "lucide-react";
import { LanguageSwitcher } from "@/src/components/common/language-switcher";

export function Footer() {
  return (
    <footer className="w-full bg-background border-t border-border pt-12 pb-8 text-sm text-muted-foreground select-none">
      <div className="mx-auto max-w-5xl px-6">
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-border">
          {/* Brand Column - spans full width on mobile, 1/5 on desktop */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-extrabold text-sm shadow-sm">
                B
              </div>
              <span className="font-bold text-sm tracking-tight text-foreground">
                Booking
                <span className="text-primary font-extrabold">Base</span>
              </span>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed font-medium max-w-[240px]">
              Booking sites and scheduling for service businesses.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-150"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="X"
                className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-150"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-150"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg border border-border bg-surface flex items-center justify-center text-muted-foreground hover:border-foreground hover:text-foreground transition-all duration-150"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Templates
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Press kit
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Contact sales
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Help center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  API reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Terms of service
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  Cookie policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  GDPR
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-foreground transition-colors text-sm"
                >
                  DPA
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mid Strip: Language and Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 border-b border-border/40 gap-4 font-medium text-sm">
          <span className="text-[13px] text-muted-foreground font-medium">
            Made for service businesses
          </span>
          <LanguageSwitcher />
        </div>

        {/* Company Registration and Legal Compliance Disclaimers (Centered, matching screenshot) */}
        <div className="mt-8 text-xs sm:text-[13px] text-muted-foreground text-center space-y-3 max-w-5xl mx-auto leading-relaxed font-medium">
          <div className="space-y-2 text-muted-foreground/80">
            <p className="whitespace-normal md:whitespace-nowrap">
              BookingBase Ltd, at{" "}
              <a
                href="#"
                className="text-primary hover:underline transition-colors"
              >
                Nafpliou 28, Medical Court, Floor 4, Flat/Office 401, 3025,
                Limassol, Cyprus
              </a>
              . HE387490, VAT No.: 10387490F.
            </p>
            <p>BookingBase is a brand of BookingBase Technologies Ltd.</p>
            <p>
              Contact us:{" "}
              <a
                href="mailto:support@bookingbase.com"
                className="text-primary hover:underline transition-colors"
              >
                support@bookingbase.com
              </a>{" "}
              or live chat for general enquiries OR{" "}
              <a
                href="mailto:legal@bookingbase.com"
                className="text-primary hover:underline transition-colors"
              >
                legal@bookingbase.com
              </a>{" "}
              for legal queries, including reporting suspected misconduct, in
              line with the EU Whistleblower Directive.
            </p>
          </div>

          {/* Copyright notice at the very bottom */}
          <p className="text-xs text-muted-foreground/60 pt-4">
            Copyright © 2026 BookingBase Ltd. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
