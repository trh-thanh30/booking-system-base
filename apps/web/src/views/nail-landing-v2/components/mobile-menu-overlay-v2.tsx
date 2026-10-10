"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, Mail, Sparkles } from "lucide-react";
import { SHOP_V2 } from "../nail-landing-v2.constants";

interface MobileMenuOverlayV2Props {
  open: boolean;
  onClose: () => void;
}

const navLinks = [
  { id: "services", label: "Services" },
  { id: "gallery", label: "Gallery" },
  { id: "pricing", label: "Pricing" },
  { id: "faq", label: "FAQs" },
  { id: "booking", label: "Book Appointment" },
];

export function MobileMenuOverlayV2({
  open,
  onClose,
}: MobileMenuOverlayV2Props) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
          />

          {/* Drawer Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
            className="fixed right-0 top-0 bottom-0 w-4/5 max-w-sm bg-brand-900 text-white z-50 p-6 flex flex-col justify-between shadow-2xl"
          >
            <div className="space-y-8">
              {/* Header inside drawer */}
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <span className="text-sm font-bold tracking-wider flex items-center gap-1.5 uppercase">
                  <Sparkles className="w-4 h-4 text-brand-100" />
                  GLOSSORA
                </span>
                <button
                  onClick={onClose}
                  className="p-1 rounded hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="flex flex-col gap-5 text-base font-semibold">
                {navLinks.map((link) => (
                  <a
                    key={link.id}
                    href={`#${link.id}`}
                    onClick={onClose}
                    className="hover:text-brand-200 transition-colors py-1"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Bottom Contacts */}
            <div className="border-t border-white/10 pt-6 space-y-4 text-xs font-light text-white/70">
              <a
                href={`tel:${SHOP_V2.phone.replace(/\s+/g, "")}`}
                className="flex items-center gap-2.5 hover:text-brand-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-brand-100" />
                <span>{SHOP_V2.phone}</span>
              </a>
              <a
                href={`mailto:${SHOP_V2.email}`}
                className="flex items-center gap-2.5 hover:text-brand-200 transition-colors"
              >
                <Mail className="w-4 h-4 text-brand-100" />
                <span>{SHOP_V2.email}</span>
              </a>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
