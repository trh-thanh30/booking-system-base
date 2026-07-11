import { motion } from "framer-motion";
import { WebsiteTemplate, TemplateService } from "@/src/views/home/home.types";

interface MobileMockupProps {
  activeTemplateIdx: number;
  activeTemplate: WebsiteTemplate;
  activeColor: string;
  templateSelectedServiceIdx: number;
  setTemplateSelectedServiceIdx: (idx: number) => void;
  shouldReduceMotion: boolean;
}

export function MobileMockup({
  activeTemplateIdx,
  activeTemplate,
  activeColor,
  templateSelectedServiceIdx,
  setTemplateSelectedServiceIdx,
  shouldReduceMotion,
}: MobileMockupProps) {
  return (
    <div className="flex lg:hidden w-full max-w-[300px] bg-zinc-900 border-[6px] border-zinc-950 rounded-[2.5rem] shadow-2xl p-3.5 pt-7 select-none relative overflow-hidden ring-1 ring-zinc-900/10">
      {/* Dynamic Island Notch */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-zinc-950 rounded-full flex items-center justify-center z-20">
        <div className="w-1.5 h-1.5 rounded-full bg-zinc-900 absolute right-3" />
      </div>

      {/* Live Booking Mobile Page Mockup Container */}
      <div className="bg-bg-primary min-h-[465px] rounded-[1.5rem] overflow-hidden flex flex-col justify-between border border-border-light/30 w-full">
        <motion.div
          key={activeTemplateIdx}
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 8 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, y: -8 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="flex flex-col h-full"
        >
          {/* Dynamic Brand Colored Header */}
          <div
            style={{ backgroundColor: activeColor }}
            className="p-4.5 text-white transition-colors duration-350 shrink-0"
          >
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <div
                  style={{ color: activeColor }}
                  className="w-5.5 h-5.5 rounded-full bg-white flex items-center justify-center text-[10px] font-black"
                >
                  {activeTemplate.avatar}
                </div>
                <span className="text-[10.5px] font-extrabold tracking-wide text-white">
                  {activeTemplate.businessName}
                </span>
              </div>
              <span className="text-white text-base leading-none opacity-85">
                ≡
              </span>
            </div>
            <h4 className="text-[13px] font-extrabold tracking-tight leading-snug text-white">
              {activeTemplate.heroTagline}
            </h4>
            <p className="text-[9.5px] text-white/85 mt-1 leading-normal">
              {activeTemplate.heroSubtitle}
            </p>
            <button
              type="button"
              style={{ color: activeColor }}
              className="mt-3 px-4 py-1 rounded-full bg-white text-[9px] font-extrabold shadow-sm leading-none"
            >
              {activeTemplate.customerCta}
            </button>
          </div>

          {/* Services and Other Sections */}
          <div className="p-3.5 flex flex-col gap-3.5 flex-1 bg-white">
            {/* Services Section */}
            <div className="space-y-2">
              <span className="text-[8px] font-extrabold text-text-muted block uppercase tracking-wider leading-none">
                Popular Services
              </span>
              <div className="space-y-1.5">
                {activeTemplate.services.map(
                  (srv: TemplateService, sidx: number) => {
                    const isSelected = templateSelectedServiceIdx === sidx;
                    return (
                      <div
                        key={sidx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTemplateSelectedServiceIdx(sidx);
                        }}
                        style={{
                          borderColor: isSelected ? activeColor : undefined,
                          backgroundColor: isSelected
                            ? `${activeColor}0c`
                            : undefined,
                        }}
                        className={`p-2.5 border rounded-xl cursor-pointer flex items-center justify-between transition-colors ${
                          isSelected
                            ? "border-l-3"
                            : "border-border-light hover:border-text-secondary bg-bg-secondary/20"
                        }`}
                      >
                        <div>
                          <span
                            style={{
                              color: isSelected ? activeColor : undefined,
                            }}
                            className="text-[9.5px] font-bold text-text-primary block leading-none"
                          >
                            {srv.name}
                          </span>
                          <span className="text-[7.5px] text-text-muted mt-0.5 block leading-none">
                            {srv.duration}
                          </span>
                        </div>
                        <span
                          style={{
                            color: isSelected ? activeColor : undefined,
                          }}
                          className="text-[9.5px] font-extrabold text-text-primary"
                        >
                          {srv.price}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>

            {/* Trust Bar Section */}
            <div className="p-2.5 bg-bg-secondary/40 rounded-xl space-y-1.5 border border-border-light/20">
              <span className="font-extrabold block text-[8px] text-text-muted uppercase tracking-wider leading-none">
                Why book with us
              </span>
              <div className="flex flex-wrap gap-x-3 gap-y-1.5">
                {activeTemplate.trustPoints.map((tp: string, tpidx: number) => (
                  <span
                    key={tpidx}
                    className="flex items-center gap-1 text-[8px] font-semibold text-text-secondary"
                  >
                    <span style={{ color: activeColor }} className="font-black">
                      ✓
                    </span>{" "}
                    {tp}
                  </span>
                ))}
              </div>
            </div>

            {/* Testimonial Quote Section */}
            <div
              style={{ borderLeftColor: activeColor }}
              className="border-l-2 pl-2.5 py-0.5"
            >
              <p
                style={{ color: activeColor }}
                className="text-[7.5px] font-extrabold leading-none uppercase tracking-wider mb-1"
              >
                What clients say
              </p>
              <p className="text-[8.5px] italic text-text-muted leading-relaxed">
                &ldquo;{activeTemplate.review}&rdquo;
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
