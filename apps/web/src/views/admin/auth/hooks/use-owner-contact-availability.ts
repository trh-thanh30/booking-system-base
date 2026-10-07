"use client";

import { useEffect, useMemo, useState } from "react";
import type { UseFormReturn } from "react-hook-form";
import {
  completeOwnerBusinessSchema,
  type CompleteOwnerBusinessInput,
  type OwnerContactField,
} from "@repo/shared";
import { authService } from "@/src/services/admin/auth.service";
import type { BusinessNameAvailabilityStatus } from "../types/business-onboarding.types";
import { createContactAvailabilityCheck } from "../utils/contact-availability.utils";

export function useOwnerContactAvailability(
  form: UseFormReturn<CompleteOwnerBusinessInput>,
  field: OwnerContactField,
  provider: "email" | "google",
) {
  const value = form.watch(`owner.${field}`) ?? "";
  const [status, setStatus] = useState<BusinessNameAvailabilityStatus>("idle");
  useEffect(() => {
    setStatus("idle");
  }, [value]);
  const check = useMemo(
    () =>
      createContactAvailabilityCheck({
        getValue: () => form.getValues(`owner.${field}`) ?? "",
        request: (input) =>
          authService.checkOwnerContact(field, input, provider),
        onStatus: setStatus,
      }),
    [form, field, provider],
  );
  return {
    status,
    check: async () => {
      const input = form.getValues(`owner.${field}`) ?? "";
      if (
        !completeOwnerBusinessSchema.shape.owner.shape[field].safeParse(input)
          .success ||
        (field === "username" && !input.trim())
      ) {
        setStatus("invalid");
        return false;
      }
      return check();
    },
  };
}
