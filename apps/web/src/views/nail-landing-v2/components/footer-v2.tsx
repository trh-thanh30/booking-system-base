"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";
import { SHOP_V2 } from "../nail-landing-v2.constants";

export function FooterV2() {
  const prefersReduced = useReducedMotion();

  const containerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const slideUp = {
    hidden: { y: 30, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring" as const,
        stiffness: 100,
        damping: 15,
      },
    },
  };

  return (
    <footer className="bg-brand-500 text-white pt-16 pb-8 border-t border-white/10 select-none overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial={prefersReduced ? "show" : "hidden"}
        whileInView="show"
        viewport={{ once: false, amount: 0.15 }}
        className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 mb-12"
      >
        {/* Column 1: Logo & Socials */}
        <motion.div variants={slideUp} className="lg:col-span-4 space-y-6">
          <a href="#" className="inline-block">
            <span className="text-xl font-bold tracking-wider font-serif flex items-center gap-1.5">
              {/* Luxury bottle outline drawing */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-brand-100"
              >
                <path d="M12 2v6" />
                <path d="M9 8h6" />
                <path d="M7 11.5V20a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-8.5" />
                <circle cx="12" cy="15" r="2" />
              </svg>
              Glossora
            </span>
            <span className="text-[10px] uppercase tracking-widest text-brand-100 block pl-8 -mt-1 font-light italic">
              Nail Salon
            </span>
          </a>
          <p className="text-sm text-white/80 font-normal leading-relaxed max-w-sm">
            Experience absolute tranquility and custom aesthetic procedures.
            Every detail of our space is curated to provide a signature luxury
            salon stay.
          </p>

          {/* Social Icons with Cream bg */}
          <div className="flex gap-3 pt-2">
            {["facebook", "instagram", "linkedin"].map((social, idx) => (
              <a
                key={idx}
                href="#"
                className="w-8 h-8 rounded-full bg-brand-100 hover:bg-white text-brand-500 flex items-center justify-center transition-all shadow-sm"
              >
                <span className="text-xs font-bold uppercase">{social[0]}</span>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Column 2: Contact Us */}
        <motion.div variants={slideUp} className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-100">
            Contact Us
          </h3>
          <ul className="space-y-3.5 text-sm font-normal text-white/80">
            <li className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-brand-100 flex-shrink-0 mt-0.5" />
              <span>{SHOP_V2.address}</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-brand-100 flex-shrink-0" />
              <a
                href={`mailto:${SHOP_V2.email}`}
                className="hover:text-brand-100 transition-colors"
              >
                {SHOP_V2.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-brand-100 flex-shrink-0" />
              <a
                href={`tel:${SHOP_V2.phone}`}
                className="hover:text-brand-100 transition-colors"
              >
                {SHOP_V2.phone}
              </a>
            </li>
          </ul>
        </motion.div>

        {/* Column 3: Quick Links */}
        <motion.div variants={slideUp} className="lg:col-span-2 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-100">
            Quick Links
          </h3>
          <ul className="space-y-2.5 text-sm font-normal text-white/80">
            {["Home", "About Us", "Services", "Pricing Plans", "FAQ"].map(
              (link, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="hover:text-brand-100 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-[10px] text-brand-100">●</span>
                    {link}
                  </a>
                </li>
              ),
            )}
          </ul>
        </motion.div>

        {/* Column 4: Our Gallery (2x2 thumbnail grid with border radius) */}
        <motion.div variants={slideUp} className="lg:col-span-3 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-100">
            Our Gallery
          </h3>
          <div className="grid grid-cols-2 gap-2 max-w-[200px]">
            {[
              "/nail-salon/sq1.jpg",
              "/nail-salon/sq2.jpg",
              "/nail-salon/sq3.jpg",
              "/nail-salon/h1.jpg",
            ].map((img, idx) => (
              <div
                key={idx}
                className="relative aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-brand-100/40 transition-all cursor-pointer bg-white/5"
              >
                <Image
                  src={img}
                  alt={`Gallery thumbnail ${idx + 1}`}
                  fill
                  className="object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Bottom Copyright bar */}
      <motion.div
        variants={slideUp}
        initial={prefersReduced ? "show" : "hidden"}
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
        className="max-w-[1200px] mx-auto px-6 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] font-light text-white/60 gap-4"
      >
        <p>
          © {new Date().getFullYear()} {SHOP_V2.name} Nail Salon. All rights
          reserved.
        </p>
        <div className="flex gap-6">
          <a href="#" className="hover:text-brand-100 transition-colors">
            Privacy Policy
          </a>
          <a href="#" className="hover:text-brand-100 transition-colors">
            Terms of Service
          </a>
        </div>
      </motion.div>
    </footer>
  );
}

export default FooterV2;
