import type { HTMLAttributes } from "react";
import { cn } from "@repo/ui/lib/utils";

export function FilterToolbar({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 shadow-xs lg:flex-row lg:items-center lg:justify-between",
        className,
      )}
      {...props}
    />
  );
}
