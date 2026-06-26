import { motion } from "framer-motion";
import { WebsiteTemplate, TemplateService } from "@/src/views/home/home.types";

interface DesktopBrowserMockupProps {
  activeTemplateIdx: number;
  activeTemplate: WebsiteTemplate;
  activeColor: string;
  templateSelectedServiceIdx: number;
  setTemplateSelectedServiceIdx: (idx: number) => void;
  shouldReduceMotion: boolean;
}

export function DesktopBrowserMockup({
  activeTemplateIdx,
  activeTemplate,
  activeColor,
  templateSelectedServiceIdx,
  setTemplateSelectedServiceIdx,
  shouldReduceMotion,
}: DesktopBrowserMockupProps) {
  return (
    <div className="hidden lg:flex flex-col w-full bg-white border border-border-light/80 rounded-2xl shadow-2xl shadow-zinc-200/60 overflow-hidden h-[465px] relative">
      {/* Browser Address Bar / Header */}
      <div className="bg-zinc-100/90 border-b border-border-light/70 px-4 py-2 flex items-center justify-between shrink-0 select-none">
        {/* Left: Window control dots */}
        <div className="flex items-center gap-1.5 w-16">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        </div>
        {/* Center: Address Bar */}
        <div className="flex-1 max-w-[240px] bg-white border border-border-light/50 rounded-lg py-1 px-2 text-[9px] text-text-muted flex items-center justify-center gap-1">
          <span className="text-emerald-500 font-extrabold text-[8px]">🔒</span>
          <span className="font-semibold tracking-wide lowercase truncate">
            {activeTemplate.businessName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")}
            .bookingbase.com
          </span>
        </div>
        {/* Right spacing */}
        <div className="w-16" />
      </div>

      {/* Browser Content Area */}
      <div className="flex-1 bg-bg-secondary/20 flex flex-col justify-between overflow-hidden relative">
        <motion.div
          key={activeTemplateIdx}
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.99 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
          exit={shouldReduceMotion ? {} : { opacity: 0, scale: 0.99 }}
          transition={{ duration: 0.22, ease: "easeInOut" }}
          className="flex flex-col h-full w-full absolute inset-0 justify-between"
        >
          {/* Navigation Header */}
          <div className="bg-white border-b border-border-light/40 py-2.5 px-4 flex items-center justify-between shrink-0 select-none">
            <div className="flex items-center gap-1.5">
              <div
                style={{ backgroundColor: activeColor }}
                className="w-5 h-5 rounded-full text-white flex items-center justify-center text-[9px] font-black"
              >
                {activeTemplate.avatar}
              </div>
              <span className="text-[10px] font-black text-text-primary tracking-wide truncate max-w-[90px]">
                {activeTemplate.businessName}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-bold text-text-muted">
              <span className="hover:text-text-primary cursor-pointer transition">
                Home
              </span>
              <span className="hover:text-text-primary cursor-pointer transition">
                Services
              </span>
            </div>
            <button
              type="button"
              style={{ backgroundColor: activeColor }}
              className="px-2.5 py-1 text-white text-[8.5px] font-extrabold rounded-full shadow-sm leading-none"
            >
              {activeTemplate.customerCta}
            </button>
          </div>

          {/* Hero & Services Grid Content */}
          <div className="flex-1 p-4 grid grid-cols-12 gap-4 min-h-0 items-center">
            {/* Left: Hero info */}
            <div className="col-span-6 space-y-2">
              <h4 className="text-[13px] font-black text-text-primary tracking-tight leading-snug">
                {activeTemplate.heroTagline}
              </h4>
              <p className="text-[9.5px] text-text-muted leading-relaxed line-clamp-3">
                {activeTemplate.heroSubtitle}
              </p>

              {/* Trust items */}
              <div className="flex flex-wrap gap-1">
                {activeTemplate.trustPoints
                  .slice(0, 2)
                  .map((tp: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-0.5 bg-white border border-border-light/50 px-1.5 py-0.5 rounded text-[7.5px] font-bold text-text-secondary shadow-sm"
                    >
                      <span
                        style={{ color: activeColor }}
                        className="font-extrabold text-[8.5px]"
                      >
                        ✓
                      </span>
                      {tp}
                    </span>
                  ))}
              </div>
            </div>

            {/* Right: Booking Services box */}
            <div className="col-span-6 bg-white border border-border-light/60 rounded-xl p-2.5 shadow-sm space-y-2">
              <span className="text-[7.5px] font-extrabold text-text-muted block uppercase tracking-wider leading-none">
                Popular Services
              </span>
              <div className="space-y-1 max-h-[160px] overflow-y-auto scrollbar-none">
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
                            ? `${activeColor}08`
                            : undefined,
                        }}
                        className={`p-1.5 border rounded-lg cursor-pointer flex items-center justify-between transition-all duration-200 select-none ${
                          isSelected
                            ? "border-l-2 shadow-[0_1px_4px_rgba(0,0,0,0.01)]"
                            : "border-border-light hover:border-text-secondary bg-bg-secondary/10"
                        }`}
                      >
                        <div className="min-w-0 pr-1">
                          <span
                            style={{
                              color: isSelected ? activeColor : undefined,
                            }}
                            className="text-[8.5px] font-extrabold text-text-primary block leading-none truncate"
                          >
                            {srv.name}
                          </span>
                          <span className="text-[7px] text-text-muted mt-0.5 block leading-none">
                            {srv.duration}
                          </span>
                        </div>
                        <span
                          style={{
                            color: isSelected ? activeColor : undefined,
                          }}
                          className="text-[8.5px] font-black text-text-primary shrink-0"
                        >
                          {srv.price}
                        </span>
                      </div>
                    );
                  },
                )}
              </div>
            </div>
          </div>

          {/* Review Footer */}
          <div className="bg-white border-t border-border-light/35 px-4 py-2 flex items-center gap-2 shrink-0 select-none">
            <span
              style={{
                backgroundColor: `${activeColor}1a`,
                color: activeColor,
              }}
              className="text-[8px] font-extrabold px-1.5 py-0.5 rounded leading-none"
            >
              Review
            </span>
            <p className="text-[9px] italic text-text-muted leading-relaxed truncate flex-1">
              &ldquo;{activeTemplate.review}&rdquo;
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
