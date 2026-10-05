import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessToastProps {
  selectedService: string;
  selectedTimeSlot: string;
}

export function SuccessToast({
  selectedService,
  selectedTimeSlot,
}: SuccessToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 25 }}
      className="absolute left-[-20px] bottom-16 bg-surface border border-input/50 rounded-[4px] shadow-2xl p-2.5 z-30 flex items-start gap-2.5 w-60 select-none"
    >
      <div className="w-6 h-6 rounded-full bg-success-surface flex items-center justify-center text-success-surface-foreground flex-shrink-0">
        <Check className="w-3.5 h-3.5 stroke-[3]" />
      </div>
      <div className="flex-grow">
        <span className="text-[9px] font-bold text-foreground block leading-none mb-0.5">
          New booking confirmed
        </span>
        <p className="text-[8px] text-muted-foreground leading-tight">
          {selectedService === "spa"
            ? "Hot Stone Massage"
            : "Deep Cleansing Facial"}{" "}
          at {selectedTimeSlot}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="text-[7px] bg-success-surface text-success-surface-foreground px-1 rounded font-bold border border-success-border">
            Paid deposit: ${selectedService === "spa" ? 15 : 18}
          </span>
          <span className="text-[7px] text-muted-foreground">Just now</span>
        </div>
      </div>
    </motion.div>
  );
}
