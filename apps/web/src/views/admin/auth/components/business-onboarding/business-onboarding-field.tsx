"use client";

import { FormField, AuthInput as Input } from "@/src/components/common";
import type { CompleteOwnerBusinessInput } from "@repo/shared";
import { useTranslations } from "next-intl";
import type { HTMLInputTypeAttribute } from "react";
import { useFormContext, type FieldPath } from "react-hook-form";

export function BusinessOnboardingField({
  name,
  label,
  type = "text",
  required = true,
}: {
  name: FieldPath<CompleteOwnerBusinessInput>;
  label: string;
  type?: HTMLInputTypeAttribute;
  required?: boolean;
}) {
  const t = useTranslations("AuthJourney");
  const form = useFormContext<CompleteOwnerBusinessInput>();
  const error = form.getFieldState(name, form.formState).error;
  const id = name.replaceAll(".", "-");
  const resetsFormattedAddress =
    name.startsWith("business_profile.address.") &&
    name !== "business_profile.address.formattedAddress";

  return (
    <FormField
      htmlFor={id}
      label={t(label)}
      error={error?.message}
      required={required}
    >
      <Input
        id={id}
        type={type}
        placeholder={t(`placeholders.${label}`)}
        {...form.register(name, {
          onChange: resetsFormattedAddress
            ? () =>
                form.setValue("business_profile.address.formattedAddress", "", {
                  shouldDirty: true,
                })
            : undefined,
        })}
      />
    </FormField>
  );
}
