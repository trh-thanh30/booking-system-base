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
      className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 text-[12.5px] font-medium text-foreground transition-colors hover:border-primary hover:text-primary cursor-pointer"
    >
      <Icon className="h-3 w-3" />
      {isPlaying ? "Stop" : "Replay flow"}
    </button>
  );
}
