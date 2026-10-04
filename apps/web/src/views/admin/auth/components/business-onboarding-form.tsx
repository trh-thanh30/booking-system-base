"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, type FieldPath } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  completeOwnerBusinessSchema,
  type CompleteOwnerBusinessInput,
  type OwnerOnboardingProfile,
} from "@repo/shared";
import { Avatar, AvatarFallback, AvatarImage, Button } from "@repo/ui";
import {
  AuthInput as Input,
  EmailInput,
  FormField,
} from "@/src/components/common";
import { BusinessLocationMap } from "./business-location-map";

export function BusinessOnboardingForm({
  profile,
  locale,
  isPending,
  onSubmit,
}: {
  profile: OwnerOnboardingProfile;
  locale: string;
  isPending: boolean;
  onSubmit: (input: CompleteOwnerBusinessInput) => Promise<void>;
}) {
  const t = useTranslations("AuthJourney");
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef<number | null>(null);
  useEffect(() => {
    if (previousStep.current !== null && previousStep.current !== step)
      heading.current?.focus();
    previousStep.current = step;
  }, [step]);
  const form = useForm<CompleteOwnerBusinessInput>({
    defaultValues: {
      name: "",
      slug: "",
      owner: { username: "", phone: "" },
      timezone: "Asia/Ho_Chi_Minh",
      locale: locale === "en" ? "en" : "vi",
      business_profile: {
        address: {
          country: "Vietnam",
          city: "",
          state: "",
          postal_code: "",
          street: "",
          location: null,
        },
        opening_hours: Array.from({ length: 7 }, (_, day) => ({
          day,
          enabled: day !== 0 && day !== 6,
          opens: "09:00",
          closes: "18:00",
        })),
      },
    },
  });
  const busy = isPending || form.formState.isSubmitting;
  const location = form.watch("business_profile.address.location");
  const days = form.watch("business_profile.opening_hours");
  async function submit(input: CompleteOwnerBusinessInput) {
    if (isPending) return;
    form.clearErrors();
    const parsed =
      step === 0
        ? completeOwnerBusinessSchema
            .pick({
              name: true,
              slug: true,
              owner: true,
              timezone: true,
              locale: true,
            })
            .safeParse(input)
        : step === 1
          ? completeOwnerBusinessSchema.shape.business_profile.shape.address.safeParse(
              input.business_profile.address,
            )
          : completeOwnerBusinessSchema.safeParse(input);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path =
          step === 1
            ? ["business_profile", "address", ...issue.path]
            : issue.path;
        form.setError(
          path.join(".") as FieldPath<CompleteOwnerBusinessInput>,
          { message: t("invalidField") },
          { shouldFocus: true },
        );
      }
      return;
    }
    if (step < 2) {
      setStep(step + 1);
      return;
    }
    const result = completeOwnerBusinessSchema.safeParse(input);
    if (result.success) await onSubmit(result.data);
  }
  function field(
    name: FieldPath<CompleteOwnerBusinessInput>,
    label: string,
    type = "text",
  ) {
    const error = form.getFieldState(name, form.formState).error;
    const id = name.replaceAll(".", "-");
    return (
      <FormField
        key={name}
        htmlFor={id}
        label={t(label)}
        error={error?.message}
      >
        <Input
          id={id}
          type={type}
          placeholder={t(`placeholders.${label}`)}
          {...form.register(name)}
        />
      </FormField>
    );
  }
  const titles = ["businessInfo", "businessAddress", "businessHours"] as const;
  return (
    <form className="space-y-5" noValidate onSubmit={form.handleSubmit(submit)}>
      <div className="flex items-center gap-3 rounded-md border bg-muted p-3">
        <Avatar className="size-10">
          <AvatarImage
            src={
              profile.avatar_url?.startsWith("https://")
                ? profile.avatar_url
                : undefined
            }
            alt={profile.full_name ?? t("verifiedAccount")}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback>{profile.full_name?.[0] ?? "B"}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">
            {profile.full_name ?? t("verifiedAccount")}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("verifiedAccount")}
          </p>
        </div>
      </div>
      <FormField htmlFor="google-email" label={t("verifiedEmail")}>
        <EmailInput
          id="google-email"
          placeholder={t("placeholders.verifiedEmail")}
          type="email"
          value={profile.email}
          readOnly
          autoComplete="off"
        />
      </FormField>
      <div
        aria-live="polite"
        className="flex items-center justify-between gap-3"
      >
        <h2
          ref={heading}
          tabIndex={-1}
          className="rounded-sm text-base font-semibold focus-visible:outline-2 focus-visible:outline-ring"
        >
          {t(titles[step]!)}
        </h2>
        <span className="shrink-0 text-sm text-muted-foreground">
          {t("step", { current: step + 1, total: 3 })}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={t("progress")}
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={step + 1}
        className="grid grid-cols-3 gap-1"
      >
        {[0, 1, 2].map((part) => (
          <span
            key={part}
            className={`h-1 rounded-full ${part <= step ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
      <fieldset disabled={busy} className="space-y-4">
        <legend className="sr-only">{t(titles[step]!)}</legend>
        {step === 0 ? (
          <>
            {field("name", "businessName")}
            {field("slug", "businessSlug")}
            <p className="text-xs text-muted-foreground">{t("slugHint")}</p>
            {field("owner.username", "username")}
            {field("owner.phone", "phone", "tel")}
            {field("timezone", "timezone")}
            <FormField htmlFor="workspace-locale" label={t("language")}>
              <select
                id="workspace-locale"
                className="h-11 w-full rounded-md border border-input bg-card px-3"
                {...form.register("locale")}
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </FormField>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("business_profile.address.country", "country")}
              {field("business_profile.address.state", "state")}
              {field("business_profile.address.city", "city")}
              {field("business_profile.address.postal_code", "postalCode")}
            </div>
            {field("business_profile.address.street", "street")}
            <BusinessLocationMap
              value={location}
              disabled={busy}
              onChange={(value) =>
                form.setValue("business_profile.address.location", value, {
                  shouldDirty: true,
                })
              }
            />
            {form.formState.errors.business_profile?.address?.location ? (
              <p role="alert" className="text-sm text-destructive">
                {t("invalidLocation")}
              </p>
            ) : null}
          </>
        ) : null}
        {step === 2 ? (
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
                    {field(
                      `business_profile.opening_hours.${index}.opens`,
                      "opens",
                      "time",
                    )}
                    {field(
                      `business_profile.opening_hours.${index}.closes`,
                      "closes",
                      "time",
                    )}
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
        ) : null}
        <div className="flex gap-3 pt-3">
          {step > 0 ? (
            <Button
              type="button"
              variant="outline"
              className="min-h-11 rounded-full"
              onClick={() => {
                form.clearErrors();
                setStep(step - 1);
              }}
            >
              {t("back")}
            </Button>
          ) : null}
          <Button
            className="min-h-11 flex-1 rounded-full"
            disabled={busy}
            type="submit"
          >
            {t(isPending ? "completing" : step === 2 ? "complete" : "continue")}
          </Button>
        </div>
      </fieldset>
    </form>
  );
}
