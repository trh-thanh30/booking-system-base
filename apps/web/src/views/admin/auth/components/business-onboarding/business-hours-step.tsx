"use client";

import type { CompleteOwnerBusinessInput } from "@repo/shared";
import { useTranslations } from "next-intl";
import { useFormContext } from "react-hook-form";
import { BusinessOnboardingField } from "./business-onboarding-field";

export function BusinessHoursStep() {
  const t = useTranslations("AuthJourney");
  const form = useFormContext<CompleteOwnerBusinessInput>();
  const days = form.watch("business_profile.opening_hours");

  return (
    <>
      <p className="text-sm text-muted-foreground">
        {t("hoursHint", { timezone: form.getValues("timezone") })}
      </p>
      {days.map((day, index) => (
        <div key={day.day} className="space-y-2 rounded-md border p-3">
          <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
            <input
              type="checkbox"
              className="size-5 accent-primary"
              {...form.register(
                `business_profile.opening_hours.${index}.enabled`,
              )}
            />
            {t(`days.${day.day}`)}
          </label>
          {day.enabled ? (
            <div className="grid grid-cols-2 gap-3">
              <BusinessOnboardingField
                name={`business_profile.opening_hours.${index}.opens`}
                label="opens"
                type="time"
              />
              <BusinessOnboardingField
                name={`business_profile.opening_hours.${index}.closes`}
                label="closes"
                type="time"
              />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("closed")}</p>
          )}
        </div>
      ))}
      {form.formState.errors.business_profile?.opening_hours?.message ? (
        <p role="alert" className="text-sm text-destructive">
          {t("invalidHours")}
        </p>
      ) : null}
    </>
  );
}
