"use client";

import {
  EmailInput,
  FormField,
  AuthInput as Input,
} from "@/src/components/common";
import { siteConfig } from "@/src/config/site.config";
import { businessCategoriesService } from "@/src/services/admin/business-categories.service";
import {
  completeOwnerBusinessSchema,
  type CompleteOwnerBusinessInput,
  type OwnerOnboardingProfile,
} from "@repo/shared";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  PhoneNumberInput,
  TimezoneSelect,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, type FieldPath } from "react-hook-form";
import {
  createBookingHost,
  createBusinessSlug,
  getCountryFromTimezone,
  getBrowserCountryName,
  getBrowserPhoneCountry,
  getBrowserTimezone,
} from "../utils/business-onboarding.utils";
import { BusinessLocationMap } from "./business-location-map";
import { useBusinessOnboardingDraft } from "../hooks/use-business-onboarding-draft";
import type { PhoneCountry } from "@repo/ui";

export function BusinessOnboardingForm({
  profile,
  locale,
  isPending,
  onSubmit,
  onDraftStateChange,
}: {
  profile: OwnerOnboardingProfile;
  locale: string;
  isPending: boolean;
  onSubmit: (input: CompleteOwnerBusinessInput) => Promise<void>;
  onDraftStateChange?: (hasDraft: boolean, clearDraft: () => void) => void;
}) {
  const t = useTranslations("AuthJourney");
  const categories = useQuery({
    queryKey: ["business-categories", "active"],
    queryFn: businessCategoriesService.listActive,
    staleTime: 5 * 60 * 1000,
  });
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
      business_category_id: "",
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
  const draft = useBusinessOnboardingDraft({
    form,
    profileEmail: profile.email,
    step,
    setStep,
    isPending,
    onDraftStateChange,
  });
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>("VN");
  useEffect(() => {
    if (!draft.hydrated || draft.hasRestoredDraft) return;
    const browserTimezone = getBrowserTimezone();
    const browserCountry =
      getCountryFromTimezone(browserTimezone) ?? getBrowserPhoneCountry();
    setPhoneCountry(browserCountry);
    if (form.getValues("business_profile.address.country") === "Vietnam") {
      form.setValue(
        "business_profile.address.country",
        getBrowserCountryName(browserCountry, locale),
        { shouldDirty: false },
      );
    }
    if (form.getValues("timezone") === "Asia/Ho_Chi_Minh") {
      form.setValue("timezone", browserTimezone, { shouldDirty: false });
    }
  }, [draft.hasRestoredDraft, draft.hydrated, form, locale]);
  const busy = isPending || form.formState.isSubmitting;
  const businessSlug = createBusinessSlug(form.watch("name"));
  const bookingHost = createBookingHost(
    businessSlug || t("bookingUrlFallback"),
    siteConfig.bookingDomain,
  );
  const location = form.watch("business_profile.address.location");
  const days = form.watch("business_profile.opening_hours");
  async function submit(input: CompleteOwnerBusinessInput) {
    if (isPending) return;
    form.clearErrors();
    const normalizedInput = {
      ...input,
      slug: createBusinessSlug(input.name),
    };
    const parsed =
      step === 0
        ? completeOwnerBusinessSchema
            .pick({
              name: true,
              business_category_id: true,
              slug: true,
              owner: true,
              timezone: true,
              locale: true,
            })
            .safeParse(normalizedInput)
        : step === 1
          ? completeOwnerBusinessSchema.shape.business_profile.shape.address.safeParse(
              normalizedInput.business_profile.address,
            )
          : completeOwnerBusinessSchema.safeParse(normalizedInput);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const path =
          step === 1
            ? ["business_profile", "address", ...issue.path]
            : issue.path[0] === "slug"
              ? ["name"]
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
    const result = completeOwnerBusinessSchema.safeParse(normalizedInput);
    if (result.success) await onSubmit(result.data);
  }
  function field(
    name: FieldPath<CompleteOwnerBusinessInput>,
    label: string,
    type = "text",
    required = true,
  ) {
    const error = form.getFieldState(name, form.formState).error;
    const id = name.replaceAll(".", "-");
    return (
      <FormField
        key={name}
        htmlFor={id}
        label={t(label)}
        error={error?.message}
        required={required}
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
          <AvatarFallback>
            {profile.full_name?.[0] ?? profile.email?.[0]}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate font-medium">
            {profile.full_name ?? profile.email ?? t("verifiedAccount")}
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
        <TooltipProvider delayDuration={100} skipDelayDuration={100}>
          <div className="contents">
            {[0, 1, 2].map((part) => (
              <Tooltip key={part}>
                <TooltipTrigger asChild>
                  <span
                    aria-label={t(titles[part]!)}
                    className={`h-1 cursor-help rounded-full ${part <= step ? "bg-primary" : "bg-muted"}`}
                  />
                </TooltipTrigger>
                <TooltipContent>{t(titles[part]!)}</TooltipContent>
              </Tooltip>
            ))}
          </div>
        </TooltipProvider>
      </div>
      <fieldset disabled={busy} className="space-y-4">
        <legend className="sr-only">{t(titles[step]!)}</legend>
        {step === 0 ? (
          <>
            {field("name", "businessName")}
            <p
              aria-live="polite"
              className="-mt-2 break-all text-xs text-muted-foreground"
            >
              {t("bookingUrlPreview", { url: bookingHost })}
            </p>
            {field("owner.username", "username")}
            <FormField
              htmlFor="owner-phone"
              label={t("phone")}
              error={form.formState.errors.owner?.phone?.message}
            >
              <Controller
                control={form.control}
                name="owner.phone"
                render={({ field: phoneField }) => (
                  <PhoneNumberInput
                    {...phoneField}
                    id="owner-phone"
                    key={phoneCountry}
                    invalid={Boolean(form.formState.errors.owner?.phone)}
                    placeholder={t("placeholders.phone")}
                    defaultCountry={phoneCountry}
                    value={phoneField.value || undefined}
                    onChange={phoneField.onChange}
                  />
                )}
              />
            </FormField>
            <FormField
              htmlFor="timezone"
              label={t("timezone")}
              error={form.formState.errors.timezone?.message}
              required
            >
              <Controller
                control={form.control}
                name="timezone"
                render={({ field: timezoneField }) => (
                  <TimezoneSelect
                    id="timezone"
                    name="timezone"
                    value={timezoneField.value}
                    onChange={timezoneField.onChange}
                    disabled={busy}
                    aria-invalid={Boolean(form.formState.errors.timezone)}
                    placeholder={t("placeholders.timezone")}
                    searchPlaceholder={t("placeholders.timezoneSearch")}
                    emptyMessage={t("placeholders.timezoneEmpty")}
                  />
                )}
              />
            </FormField>
            <FormField
              htmlFor="business-category"
              label={t("businessCategory")}
              error={
                form.formState.errors.business_category_id?.message ||
                (categories.isError
                  ? t("businessCategoryLoadFailed")
                  : undefined)
              }
              required
            >
              <Select
                value={form.watch("business_category_id") || undefined}
                disabled={busy || categories.isPending || categories.isError}
                onValueChange={(value) =>
                  form.setValue("business_category_id", value, {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger
                  id="business-category"
                  aria-invalid={
                    Boolean(form.formState.errors.business_category_id) ||
                    categories.isError
                  }
                >
                  <SelectValue
                    placeholder={
                      categories.isPending
                        ? t("businessCategoryLoading")
                        : t("placeholders.businessCategory")
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.data?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {locale === "en" ? category.name_en : category.name_vi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categories.isError ? (
                <Button
                  type="button"
                  variant="ghost"
                  className="h-auto justify-start px-0 py-1"
                  disabled={categories.isFetching}
                  onClick={() => void categories.refetch()}
                >
                  {t("retry")}
                </Button>
              ) : null}
            </FormField>
          </>
        ) : null}
        {step === 1 ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {field("business_profile.address.country", "country")}
              {field("business_profile.address.state", "state", "text", false)}
              {field("business_profile.address.city", "city")}
              {field(
                "business_profile.address.postal_code",
                "postalCode",
                "text",
                false,
              )}
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
