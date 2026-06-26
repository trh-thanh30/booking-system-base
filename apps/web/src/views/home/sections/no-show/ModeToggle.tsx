"use client";

import { Check, X } from "lucide-react";
import type { Mode } from "./NoShowSection.types";

interface Props {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export function ModeToggle({ mode, onChange }: Props) {
  return (
    <div className="inline-flex rounded-full border border-border-light bg-bg-secondary p-[3px]">
      <button
        type="button"
        onClick={() => onChange("with")}
        aria-pressed={mode === "with"}
        className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
          mode === "with"
            ? "bg-success text-white shadow-[0_2px_8px_rgba(16,185,129,0.3)]"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
        With system
      </button>
      <button
        type="button"
        onClick={() => onChange("without")}
        aria-pressed={mode === "without"}
        className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 ${
          mode === "without"
            ? "bg-danger text-white shadow-[0_2px_8px_rgba(239,68,68,0.3)]"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        <X className="h-3.5 w-3.5" strokeWidth={3} />
        Without
      </button>
    </div>
  );
}
