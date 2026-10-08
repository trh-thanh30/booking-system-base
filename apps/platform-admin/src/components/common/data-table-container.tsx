import type { HTMLAttributes } from "react";
import { cn } from "@repo/ui/lib/utils";

export function DataTableContainer({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "min-w-0 overflow-hidden rounded-lg border border-border bg-card shadow-xs",
        className,
      )}
      {...props}
    >
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}
