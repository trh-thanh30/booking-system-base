import type { ComponentProps } from "react";
import { Mail } from "lucide-react";
import { cn } from "@repo/ui";
import { AuthInput } from "./auth-input";

export function EmailInput({
  className,
  type = "email",
  ...props
}: ComponentProps<typeof AuthInput>) {
  return (
    <div className="relative">
      <Mail
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <AuthInput {...props} type={type} className={cn("pl-10", className)} />
    </div>
  );
}
