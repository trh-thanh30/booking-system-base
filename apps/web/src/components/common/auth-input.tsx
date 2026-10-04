import type { ComponentProps } from "react";
import { Input, cn } from "@repo/ui";

/** Auth fields match the card surface without changing dashboard input styling. */
export function AuthInput({
  className,
  ...props
}: ComponentProps<typeof Input>) {
  return <Input {...props} className={cn("bg-card", className)} />;
}
