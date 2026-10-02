"use client";

interface Props {
  isPlaying: boolean;
  onToggle: () => void;
}

export function TourControl({ isPlaying, onToggle }: Props) {
  return (
    <div className="mb-8 flex items-center justify-center gap-3 flex-wrap select-none font-sans">
      <span className="text-[12.5px] text-muted-foreground font-medium opacity-85">
        Auto-tour shows all 4 pairings automatically
      </span>
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12.5px] font-semibold border transition cursor-pointer select-none active:scale-[0.98] duration-150 ${
          isPlaying
            ? "bg-primary text-primary-foreground border-primary shadow-md"
            : "bg-surface text-foreground border-border hover:border-primary hover:text-primary shadow-sm"
        }`}
      >
        <span className="relative flex h-2 w-2">
          {isPlaying && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? "bg-surface" : "bg-primary"}`}
          />
        </span>
        {isPlaying ? "Stop tour" : "Play tour"}
      </button>
    </div>
  );
}
