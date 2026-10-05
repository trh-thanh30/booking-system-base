"use client";

import type { ReactNode } from "react";
import { FormField } from "@/src/components/common/form-field";

export function RegistrationField({
  error,
  id,
  label,
  children,
}: {
  error?: string;
  id: string;
  label: string;
  children: ReactNode;
}) {
  return (
    <FormField htmlFor={id} label={label} error={error}>
      {children}
    </FormField>
  );
}
