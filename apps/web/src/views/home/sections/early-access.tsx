"use client";
import { Dialog, DialogContent, DialogTitle } from "@repo/ui";

import { useState, useEffect, useRef } from "react";
import { useToast } from "@repo/hooks";
import {
  Check,
  Lock,
  Calendar,
  Gift,
  Shield,
  RotateCcw,
  Clock,
  Star,
  X,
  ArrowRight,
} from "lucide-react";
import { RepeatReveal } from "@/src/components/motion/RepeatReveal";
import { MotionButton } from "@/src/components/motion/MotionButton";

// Custom dynamic count-up component using IntersectionObserver
function CountUp({
  to,
  duration = 1600,
  decimals = 0,
  suffix = "",
}: {
  to: number;
  duration?: number;
  decimals?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const start = 0;
          const startTime = performance.now();

          const step = (now: number) => {
            const progress = Math.min((now - startTime) / duration, 1);
            // Ease out cubic
            const eased = 1 - Math.pow(1 - progress, 3);
            const val = start + (to - start) * eased;
            setCount(val);
            if (progress < 1) {
              requestAnimationFrame(step);
            }
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [to, duration]);

  return <span ref={elementRef}>{count.toFixed(decimals) + suffix}</span>;
}

export function EarlyAccess() {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Form states
  const [selectedPain, setSelectedPain] = useState("");
  const [featureIdea, setFeatureIdea] = useState("");
  const [email, setEmail] = useState("");

  const handleStartTrial = () => {
    toast.success("✓ Redirecting to signup →");
    const el = document.getElementById("pricing");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleOpenModal = () => {
    setSelectedPain("");
    setFeatureIdea("");
    setEmail("");
    setShowSuccess(false);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "";
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuccess(true);
    toast.success("🎁 +14 days added to your trial!");
  };

  return (
    <RepeatReveal
      as="section"
      id="early-access"
      className="scroll-mt-20 md:scroll-mt-24 py-16 md:py-24 lg:py-28 bg-surface border-t border-border relative"
    >
      <div className="mx-auto w-full max-w-landing px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
          {/* LEFT COLUMN: Headings and Social Proof */}
          <div className="lg:col-span-6 space-y-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-100 bg-accent/60 px-3.5 py-1 text-[11px] font-bold text-primary uppercase tracking-wider select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping" />
              Early Access Program
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Start your 14-day early access trial
            </h2>

            <p className="text-muted-foreground text-base leading-relaxed">
              Build your booking site, publish your page and test real booking
              workflows before the public launch.
            </p>

            {/* Social proof card with live count-up */}
            <div className="flex items-center gap-3.5 p-3 bg-surface border border-border rounded-2xl transition shadow-sm hover:shadow-md max-w-md select-none">
              <div className="flex -space-x-2.5">
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-danger-200 text-danger-surface-foreground text-xs font-extrabold flex items-center justify-center">
                  S
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-success-200 text-success-surface-foreground text-xs font-extrabold flex items-center justify-center">
                  M
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-info-200 text-info-surface-foreground text-xs font-extrabold flex items-center justify-center">
                  J
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-accent text-accent-foreground text-xs font-extrabold flex items-center justify-center">
                  A
                </div>
                <div className="w-8 h-8 rounded-full border-2 border-surface bg-foreground text-primary-foreground text-[10px] font-extrabold flex items-center justify-center">
                  +<CountUp to={243} />
                </div>
              </div>
              <div className="text-xs text-foreground leading-normal">
                <strong>
                  <CountUp to={247} /> early testers
                </strong>{" "}
                are building their booking sites right now.
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 w-full">
              <MotionButton
                variant="primary"
                className="w-full sm:w-auto h-12 px-8 text-sm font-bold cursor-pointer inline-flex items-center gap-2"
                onClick={handleStartTrial}
              >
                <span>Start 14-day free trial</span>
                <ArrowRight className="w-4 h-4" />
              </MotionButton>

              <button
                type="button"
                onClick={handleOpenModal}
                className="w-full sm:w-auto inline-flex h-12 items-center justify-center gap-2 rounded-full border border-border bg-surface hover:border-primary hover:bg-accent/20 px-6 text-sm font-bold text-foreground transition shadow-sm hover:shadow active:scale-[0.98] cursor-pointer"
              >
                <span>Share feedback</span>
                <span className="bg-warning-surface border border-warning-border text-warning-surface-foreground px-2 py-0.5 rounded-md text-[9px] font-extrabold animate-pulse">
                  Earn rewards
                </span>
              </button>
            </div>

            {/* Footnote */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground select-none pt-1">
              <Lock className="w-3.5 h-3.5 text-muted-foreground" />
              <span>
                No credit card required. Trial accounts will not be
                auto-charged.
              </span>
            </div>
          </div>

          {/* RIGHT COLUMN: Benefit Cards */}
          <div className="lg:col-span-6 space-y-4">
            {/* Card 1 */}
            <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent text-primary flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-sm font-bold text-foreground">
                    14-day early access trial
                  </h3>
                  <span className="text-[10px] bg-accent border border-primary-100 text-primary px-2 py-0.5 rounded-full font-bold">
                    All 20+ features unlocked
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Unlock all Pro features — dashboard, custom domain, payments,
                  advanced analytics, integrations.
                </p>
              </div>
            </div>

            {/* Card 2 */}
            <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-info-surface text-info-surface-foreground flex items-center justify-center flex-shrink-0">
                <Gift className="w-5 h-5" />
              </div>
              <div className="space-y-2 flex-1">
                <h3 className="text-sm font-bold text-foreground">
                  Feedback unlocks rewards
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Helpful feedback can earn up to <strong>30 extra days</strong>
                  , <strong>50% launch discount</strong>, or swag.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[9px] bg-warning-surface border border-warning-border text-warning-surface-foreground px-2 py-0.5 rounded-md font-bold">
                    +30 days
                  </span>
                  <span className="text-[9px] bg-warning-surface border border-warning-border text-warning-surface-foreground px-2 py-0.5 rounded-md font-bold">
                    50% off
                  </span>
                  <span className="text-[9px] bg-warning-surface border border-warning-border text-warning-surface-foreground px-2 py-0.5 rounded-md font-bold">
                    Swag pack
                  </span>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="p-6 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-success-surface text-success-surface-foreground flex items-center justify-center flex-shrink-0">
                <Check className="w-5.5 h-5.5 stroke-[3]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-foreground">
                  No card, no auto-charge
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Cancel anytime in 1 click. Your data stays yours forever —
                  export or delete from your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* TESTIMONIAL BAR */}
        <div className="mt-16 p-6 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition duration-300 grid grid-cols-1 md:grid-cols-12 gap-6 items-center select-none">
          <div className="md:col-span-1 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-danger-300 to-danger-500 text-primary-foreground font-extrabold text-base flex items-center justify-center shadow-inner">
              SK
            </div>
          </div>
          <div className="md:col-span-8 space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-0.5 text-warning-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-foreground italic leading-relaxed">
              &ldquo;Got 3 extra weeks + 50% launch pricing by sharing feedback.
              The setup was so quick I was taking bookings the same day.&rdquo;
            </p>
            <span className="text-[10px] text-muted-foreground block">
              — Sarah K., Wellness Studio · Day 22 of trial
            </span>
          </div>
          <div className="md:col-span-3 text-center md:text-right border-t md:border-t-0 md:border-l border-border/75 pt-4 md:pt-0 md:pl-6 space-y-0.5">
            <div className="text-3xl font-extrabold text-primary tracking-tight">
              <CountUp to={4.8} decimals={1} />
            </div>
            <div className="text-[10px] text-muted-foreground">
              avg from <CountUp to={184} /> reviews
            </div>
          </div>
        </div>

        {/* TRUST BADGES BAR */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 mt-12 pt-8 border-t border-border/60 text-xs text-foreground select-none font-medium">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-success-500" />
            <span>No credit card</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-success-500" />
            <span>GDPR compliant</span>
          </div>
          <div className="flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-success-500" />
            <span>Cancel anytime</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-success-500" />
            <span>5-minute setup</span>
          </div>
        </div>
      </div>

      {/* FEEDBACK MODAL OVERLAY */}
      {isModalOpen && (
        <Dialog
          open={isModalOpen}
          onOpenChange={(open) => {
            if (!open) handleCloseModal();
          }}
        >
          <DialogContent
            aria-describedby={undefined}
            className="max-w-lg rounded-xl p-6 sm:p-8 max-h-[90dvh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DialogTitle className="text-heading-4 font-bold text-foreground">
                  Quick feedback · 60 seconds
                </DialogTitle>
                <span className="text-[10px] bg-info-surface text-info-surface-foreground px-2 py-0.5 rounded-full font-bold flex items-center gap-1 select-none">
                  ⏱ 60s
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="p-1.5 rounded-lg text-muted-foreground hover:bg-background hover:text-foreground transition cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-6">
              Help shape the launch — and unlock rewards for your contribution.
            </p>

            {/* FORM VIEW */}
            {!showSuccess ? (
              <form onSubmit={handleFormSubmit} className="space-y-5">
                {/* Question 1 */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-foreground block">
                    1. Biggest pain with your current booking setup?
                  </label>
                  <div className="space-y-2">
                    {[
                      {
                        id: "pricing",
                        label: "Confusing pricing & hidden fees",
                      },
                      { id: "setup", label: "Too slow to set up" },
                      { id: "payments", label: "Limited payment options" },
                      { id: "mobile", label: "Bad mobile experience" },
                      { id: "other", label: "Other (tell us below)" },
                    ].map((opt) => (
                      <label
                        key={opt.id}
                        className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition ${
                          selectedPain === opt.id
                            ? "bg-accent/55 border-primary font-bold text-primary"
                            : "border-border bg-surface hover:border-input hover:bg-background/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="pain"
                          value={opt.id}
                          checked={selectedPain === opt.id}
                          onChange={() => setSelectedPain(opt.id)}
                          className="accent-primary cursor-pointer"
                          required
                        />
                        <span className="text-xs text-foreground">
                          {opt.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    2. Anything specific you wish this product did?
                  </label>
                  <textarea
                    value={featureIdea}
                    onChange={(e) => setFeatureIdea(e.target.value)}
                    placeholder="Optional — share any feature ideas, bugs, or wishlist items…"
                    className="w-full text-xs border border-border rounded-xl p-3 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus:border-primary focus:ring-2 focus:ring-primary-100 min-h-[72px] resize-y placeholder:text-muted-foreground"
                  />
                </div>

                {/* Question 3 */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-foreground block">
                    3. Email (so we can reach you about rewards)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@yourbusiness.com"
                    className="w-full text-xs border border-border rounded-xl px-3 py-2.5 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 focus:border-primary focus:ring-2 focus:ring-primary-100 placeholder:text-muted-foreground"
                    required
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-xs font-bold text-foreground hover:bg-background border border-border rounded-full active:scale-[0.98] transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold text-primary-foreground bg-primary hover:opacity-95 shadow-md shadow-primary-500/20 rounded-full active:scale-[0.98] transition cursor-pointer"
                  >
                    Submit feedback
                  </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[9px] text-muted-foreground select-none pt-2 border-t border-border/60">
                  <Lock className="w-3 h-3" />
                  <span>
                    Your info stays private. Used only to follow up on rewards.
                  </span>
                </div>
              </form>
            ) : (
              /* SUCCESS VIEW */
              <div className="text-center py-6 space-y-5 animate-[fadeIn_0.3s_ease-out]">
                <div className="w-14 h-14 bg-success-surface text-success-500 rounded-full flex items-center justify-center mx-auto border border-success-border">
                  <Check className="w-6 h-6 stroke-[3]" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-base font-extrabold text-foreground">
                    Thanks for the feedback! 🎉
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    We&apos;ve added a reward to your trial account.
                  </p>
                </div>

                {/* Reward info card */}
                <div className="bg-warning-surface/60 border border-warning-border rounded-2xl p-4 flex items-center gap-3.5 text-left max-w-sm mx-auto shadow-sm">
                  <div className="text-2xl shrink-0">🎁</div>
                  <div className="text-xs text-warning-surface-foreground leading-normal">
                    <strong className="block text-foreground font-bold text-[13px] mb-0.5">
                      +14 days added
                    </strong>
                    Total trial: 28 days. You can earn more by sharing
                    BookingBase with other founders.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full h-11 font-bold text-primary-foreground bg-primary hover:opacity-95 rounded-full shadow-md active:scale-[0.98] transition text-xs cursor-pointer"
                >
                  Got it, back to site
                </button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </RepeatReveal>
  );
}
