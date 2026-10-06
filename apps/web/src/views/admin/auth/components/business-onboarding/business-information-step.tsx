"use client";

import { FormField, AuthInput as Input } from "@/src/components/common";
import { siteConfig } from "@/src/config/site.config";
import { businessCategoriesService } from "@/src/services/admin/business-categories.service";
import type { CompleteOwnerBusinessInput } from "@repo/shared";
import {
  Button,
  PhoneNumberInput,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  TimezoneSelect,
  type PhoneCountry,
} from "@repo/ui";
import { useQuery } from "@tanstack/react-query";
import { Check, CircleX, LoaderCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";
import type { BusinessNameAvailabilityStatus } from "../../types/business-onboarding.types";
import { createBookingHost } from "../../utils/business-onboarding.utils";
import { BusinessOnboardingField } from "./business-onboarding-field";

export function BusinessInformationStep({
  locale,
  disabled,
  phoneCountry,
  businessSlug,
  businessNameStatus,
  onCheckBusinessName,
}: {
  locale: string;
  disabled: boolean;
  phoneCountry: PhoneCountry;
  businessSlug: string;
  businessNameStatus: BusinessNameAvailabilityStatus;
  onCheckBusinessName: () => Promise<void>;
}) {
  const t = useTranslations("AuthJourney");
  const form = useFormContext<CompleteOwnerBusinessInput>();
  const categories = useQuery({
    queryKey: ["business-categories", "active"],
    queryFn: businessCategoriesService.listActive,
    staleTime: 5 * 60 * 1000,
  });
  const bookingHost = createBookingHost(
    businessSlug || t("bookingUrlFallback"),
    siteConfig.bookingDomain,
  );
  const fieldError = form.getFieldState("name", form.formState).error?.message;
  const statusError =
    businessNameStatus === "unavailable" || businessNameStatus === "invalid"
      ? t(
          businessNameStatus === "unavailable"
            ? "businessNameUnavailable"
            : "businessNameInvalid",
        )
      : undefined;
  const statusMessage =
    businessNameStatus === "error" ? t("businessNameCheckFailed") : undefined;
  const hasStatusError = Boolean(statusError || fieldError);
  const statusIcon =
    businessNameStatus === "checking" ? (
      <LoaderCircle
        aria-label={t("businessNameChecking")}
        className="size-4 animate-spin text-muted-foreground"
      />
    ) : businessNameStatus === "available" ? (
      <Check
        aria-label={t("businessNameAvailable")}
        className="size-4 text-success-600"
      />
    ) : hasStatusError || businessNameStatus === "error" ? (
      <CircleX
        aria-label={t("businessNameUnavailable")}
        className="size-4 text-destructive"
      />
    ) : null;

  return (
    <>
      <FormField
        htmlFor="name"
        label={t("businessName")}
        error={fieldError || statusError}
        description={statusMessage}
        descriptionRole="status"
        descriptionClassName={
          businessNameStatus === "error" ? "text-destructive" : undefined
        }
        required
      >
        <div className="relative">
          <Input
            id="name"
            type="text"
            placeholder={t("placeholders.businessName")}
            className={hasStatusError ? "border-destructive pr-10" : "pr-10"}
            aria-invalid={hasStatusError}
            aria-required="true"
            {...form.register("name", {
              onBlur: () => void onCheckBusinessName(),
            })}
          />
          {statusIcon ? (
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              {statusIcon}
            </span>
          ) : null}
        </div>
      </FormField>
      <p
        aria-live="polite"
        className="-mt-2 break-all text-xs text-muted-foreground"
      >
        {t("bookingUrlPreview", { url: bookingHost })}
      </p>
      <BusinessOnboardingField name="owner.username" label="username" />
      <FormField
        htmlFor="owner-phone"
        label={t("phone")}
        error={form.formState.errors.owner?.phone?.message}
      >
        <Controller
          control={form.control}
          name="owner.phone"
          render={({ field }) => (
            <PhoneNumberInput
              {...field}
              id="owner-phone"
              key={phoneCountry}
              invalid={Boolean(form.formState.errors.owner?.phone)}
              placeholder={t("placeholders.phone")}
              defaultCountry={phoneCountry}
              value={field.value || undefined}
              onChange={field.onChange}
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
          render={({ field }) => (
            <TimezoneSelect
              id="timezone"
              name="timezone"
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
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
          (categories.isError ? t("businessCategoryLoadFailed") : undefined)
        }
        required
      >
        <Controller
          control={form.control}
          name="business_category_id"
          render={({ field }) => (
            <Select
              value={field.value || undefined}
              disabled={disabled || categories.isPending || categories.isError}
              onValueChange={field.onChange}
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
          )}
        />
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
  );
}
