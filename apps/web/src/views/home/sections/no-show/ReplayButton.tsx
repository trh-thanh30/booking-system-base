"use client";

import { RotateCcw, Square } from "lucide-react";

interface Props {
  isPlaying: boolean;
  onClick: () => void;
}

export function ReplayButton({ isPlaying, onClick }: Props) {
  const Icon = isPlaying ? Square : RotateCcw;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-border-light bg-bg-primary px-4 py-2 text-[12.5px] font-medium text-text-primary transition-colors hover:border-brand-blue hover:text-brand-blue cursor-pointer"
    >
      <Icon className="h-3 w-3" />
      {isPlaying ? "Stop" : "Replay flow"}
    </button>
  );
}
