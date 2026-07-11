"use client";

import { Check, X } from "lucide-react";
import type { OutcomeData } from "./NoShowSection.types";

interface Props {
  outcome: OutcomeData;
  visible: boolean;
}

export function OutcomeCard({ outcome, visible }: Props) {
  const isSuccess = outcome.variant === "success";
  const Icon = isSuccess ? Check : X;

  return (
    <div
      className={`mt-5 flex items-center gap-3 rounded-xl border px-4 py-3.5 transition-all duration-500 ${
        isSuccess
          ? "bg-success-bg border-success-border text-emerald-800"
          : "bg-danger-bg border-danger-border text-red-800"
      } ${visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"}`}
    >
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-bg-primary shadow-sm">
        <Icon
          className={`h-[18px] w-[18px] ${isSuccess ? "text-emerald-600" : "text-red-600"}`}
          strokeWidth={3}
        />
      </div>
      <div className="flex-1">
        <div className="text-[14px] font-bold">{outcome.title}</div>
        <div className="mt-0.5 text-[12.5px] opacity-90">{outcome.sub}</div>
      </div>
    </div>
  );
}
