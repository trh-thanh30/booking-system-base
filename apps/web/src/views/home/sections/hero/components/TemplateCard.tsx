import {
  CheckCircle2,
  Clock,
  ShieldCheck,
  Star,
  ArrowRight,
} from "lucide-react";
import type { HeroTemplate } from "../types/hero.types";

export function TemplateCard({ tmpl }: { tmpl: HeroTemplate }) {
  return (
    <div className="w-[440px] sm:w-[480px] shrink-0 rounded-3xl border border-border bg-surface p-7 sm:p-8 shadow-xs hover:shadow-xl hover:border-primary/40 transition-all text-left flex flex-col justify-between select-none">
      {/* Top Template Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-input" />
            <span className="w-3 h-3 rounded-full bg-input" />
            <span className="w-3 h-3 rounded-full bg-input" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground bg-muted border border-border/60 px-3 py-1 rounded-full">
            {tmpl.category}
          </span>
        </div>

        {/* Merchant Header */}
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            {tmpl.avatarText}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-foreground truncate">
                {tmpl.name}
              </h3>
              <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
            </div>
            <div className="flex items-center gap-2 mt-0.5 text-xs sm:text-sm text-muted-foreground">
              <div className="flex items-center text-warning-600">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="font-semibold ml-1 text-foreground">
                  {tmpl.rating}
                </span>
              </div>
              <span>•</span>
              <span>{tmpl.reviewsCount} reviews</span>
            </div>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
          {tmpl.tagline}
        </p>

        {/* Service List */}
        <div className="space-y-2.5 pt-1">
          {tmpl.services.map((srv, srvIdx) => (
            <div
              key={srvIdx}
              className="p-3 rounded-2xl border border-border/80 bg-muted/80 flex items-center justify-between"
            >
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {srv.name}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <Clock className="w-3.5 h-3.5" /> {srv.duration}
                </p>
              </div>
              <span className="text-sm font-extrabold text-foreground">
                {srv.price}
              </span>
            </div>
          ))}
        </div>

        {/* Time Slots Preview */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Available Today
          </span>
          <div className="grid grid-cols-4 gap-2">
            {tmpl.slots.map((slot, sIdx) => (
              <span
                key={sIdx}
                className={`text-center py-2 text-xs font-bold rounded-xl border ${
                  sIdx === 1
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface text-muted-foreground border-border"
                }`}
              >
                {slot.split(" ")[0]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom CTA on Card */}
      <div className="pt-5 mt-5 border-t border-border flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-primary" />
          Instant Booking
        </span>
        <span className="text-sm font-bold text-primary hover:underline inline-flex items-center gap-1.5 cursor-pointer">
          {tmpl.cta}
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}
