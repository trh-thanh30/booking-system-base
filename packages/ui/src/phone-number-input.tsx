"use client";

import PhoneInput from "react-phone-number-input";
import flags from "react-phone-number-input/flags";
import type { ComponentProps } from "react";
import type { Country } from "react-phone-number-input";
import { cn } from "@/lib/utils";

export type PhoneNumberInputProps = Omit<
  ComponentProps<typeof PhoneInput>,
  "className"
> & {
  className?: string;
  invalid?: boolean;
};
export type PhoneCountry = Country;

/** Shared international phone input with country flags and calling codes. */
export function PhoneNumberInput({
  className,
  invalid,
  onChange,
  defaultCountry,
  ...props
}: PhoneNumberInputProps) {
  return (
    <PhoneInput
      {...props}
      className={cn("phone-number-input", invalid && "is-invalid", className)}
      countryCallingCodeEditable={false}
      defaultCountry={defaultCountry ?? "VN"}
      flags={flags}
      international
      onChange={onChange}
    />
  );
}
