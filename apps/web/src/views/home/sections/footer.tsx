"use client";

import Link from "next/link";
import { Linkedin, Twitter, Youtube, Github, Globe } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-bg-secondary border-t border-border-light pt-12 pb-8 text-sm text-text-muted select-none">
      <div className="mx-auto max-w-5xl px-6">
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-border-light">
          {/* Brand Column - spans full width on mobile, 1/5 on desktop */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand-blue rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow-sm">
                B
              </div>
              <span className="font-bold text-sm tracking-tight text-text-primary">
                Booking
                <span className="text-brand-blue font-extrabold">Base</span>
              </span>
            </div>
            <p className="text-[13px] text-text-muted leading-relaxed font-medium max-w-[240px]">
              Booking sites and scheduling for service businesses.
            </p>
            <div className="flex gap-2">
              <a
                href="#"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg border border-border-light bg-white flex items-center justify-center text-text-muted hover:border-text-primary hover:text-text-primary transition-all duration-150"
              >
                <Linkedin className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="X"
                className="w-8 h-8 rounded-lg border border-border-light bg-white flex items-center justify-center text-text-muted hover:border-text-primary hover:text-text-primary transition-all duration-150"
              >
                <Twitter className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="YouTube"
                className="w-8 h-8 rounded-lg border border-border-light bg-white flex items-center justify-center text-text-muted hover:border-text-primary hover:text-text-primary transition-all duration-150"
              >
                <Youtube className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="w-8 h-8 rounded-lg border border-border-light bg-white flex items-center justify-center text-text-muted hover:border-text-primary hover:text-text-primary transition-all duration-150"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Product Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Templates
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Integrations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Changelog
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
              Company
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Blog
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Careers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Press kit
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Contact sales
                </a>
              </li>
            </ul>
          </div>

          {/* Resources Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
              Resources
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Help center
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Documentation
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  API reference
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Community
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Status
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-3">
            <h4 className="text-[11px] font-bold text-text-primary uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-2 font-medium">
              <li>
                <Link
                  href="/privacy"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Privacy policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Terms of service
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  Cookie policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  GDPR
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="hover:text-text-primary transition-colors text-sm"
                >
                  DPA
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Mid Strip: Language and Info */}
        <div className="flex flex-col sm:flex-row justify-between items-center py-6 border-b border-border-light/40 gap-4 font-medium text-sm">
          <span className="text-[13px] text-text-muted font-medium">
            Made for service businesses
          </span>
          <button className="flex items-center gap-1 bg-white border border-border-light rounded-lg px-2.5 py-1 text-xs text-text-muted hover:border-text-primary hover:text-text-primary transition-all duration-150 cursor-pointer">
            <Globe className="w-3.5 h-3.5 text-text-muted" /> English ▾
          </button>
        </div>

        {/* Company Registration and Legal Compliance Disclaimers (Centered, matching screenshot) */}
        <div className="mt-8 text-xs sm:text-[13px] text-text-muted text-center space-y-3 max-w-5xl mx-auto leading-relaxed font-medium">
          <div className="space-y-2 text-text-muted/80">
            <p className="whitespace-normal md:whitespace-nowrap">
              BookingBase Ltd, at{" "}
              <a
                href="#"
                className="text-brand-blue hover:underline transition-colors"
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
                className="text-brand-blue hover:underline transition-colors"
              >
                support@bookingbase.com
              </a>{" "}
              or live chat for general enquiries OR{" "}
              <a
                href="mailto:legal@bookingbase.com"
                className="text-brand-blue hover:underline transition-colors"
              >
                legal@bookingbase.com
              </a>{" "}
              for legal queries, including reporting suspected misconduct, in
              line with the EU Whistleblower Directive.
            </p>
          </div>

          {/* Copyright notice at the very bottom */}
          <p className="text-xs text-text-muted/60 pt-4">
            Copyright © 2026 BookingBase Ltd. All rights reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
