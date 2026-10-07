"use client";

import { forwardRef, useState, type ComponentProps } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button, Input } from "@repo/ui";

export const PasswordInput = forwardRef<
  HTMLInputElement,
  ComponentProps<typeof Input>
>(function PasswordInput({ className = "", disabled, ...props }, ref) {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("AuthJourney");
  return (
    <div className="relative">
      <Lock
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        {...props}
        ref={ref}
        disabled={disabled}
        type={visible ? "text" : "password"}
        placeholder={props.placeholder ?? t("placeholders.password")}
        className={`h-11 bg-card pl-10 pr-12 ${className}`}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 size-11 bg-transparent text-muted-foreground hover:bg-transparent hover:text-muted-foreground active:bg-transparent"
        disabled={disabled}
        aria-label={t(visible ? "hidePassword" : "showPassword")}
        aria-pressed={visible}
        onClick={() => setVisible((value) => !value)}
      >
        {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </Button>
    </div>
  );
});
