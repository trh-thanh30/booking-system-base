"use client";

import type { ComponentProps } from "react";
import { useLocale } from "next-intl";
import { Input } from "@repo/ui";
import {
  formatServicePriceInput,
  parseServicePriceInput,
} from "../utils/service-price.utils";

export function ServicePriceInput({
  value,
  onValueChange,
  ...props
}: Omit<
  ComponentProps<typeof Input>,
  "value" | "defaultValue" | "onChange" | "type"
> & {
  value: string;
  onValueChange: (digits: string) => void;
}) {
  const locale = useLocale();
  const displayed = formatServicePriceInput(value, locale);
  return (
    <Input
      {...props}
      type="text"
      inputMode="numeric"
      value={displayed}
      onChange={(event) => {
        const input = event.currentTarget;
        const next = parseServicePriceInput(input.value, locale);
        if (next === null) return;
        const beforeCaret = input.value.slice(
          0,
          input.selectionStart ?? input.value.length,
        );
        const raw = input.value.replace(/\D/g, "");
        const digitCount = Math.max(
          0,
          beforeCaret.replace(/\D/g, "").length - (raw.length - next.length),
        );
        const formatted = formatServicePriceInput(next, locale);
        let position = 0;
        let digits = 0;
        while (position < formatted.length && digits < digitCount) {
          if (/\d/.test(formatted[position]!)) digits++;
          position++;
        }
        onValueChange(next);
        requestAnimationFrame(() => {
          if (
            input.isConnected &&
            document.activeElement === input &&
            input.value === formatted
          )
            input.setSelectionRange(position, position);
        });
      }}
    />
  );
}
