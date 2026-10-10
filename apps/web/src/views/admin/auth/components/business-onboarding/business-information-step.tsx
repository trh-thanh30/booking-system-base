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
import { useRef } from "react";
import { Controller, useFormContext } from "react-hook-form";
import type { BusinessNameAvailabilityStatus } from "../../types/business-onboarding.types";
import { createBusinessSlug } from "../../utils/business-onboarding.utils";
import { BusinessOnboardingField } from "./business-onboarding-field";

export function BusinessInformationStep({
  locale,
  disabled,
  phoneCountry,
  businessNameStatus,
  onCheckBusinessName,
  usernameStatus,
  phoneStatus,
  onCheckUsername,
  onCheckPhone,
}: {
  locale: string;
  disabled: boolean;
  phoneCountry: PhoneCountry;
  businessNameStatus: BusinessNameAvailabilityStatus;
  onCheckBusinessName: () => Promise<void>;
  usernameStatus: BusinessNameAvailabilityStatus;
  phoneStatus: BusinessNameAvailabilityStatus;
  onCheckUsername: () => Promise<boolean>;
  onCheckPhone: () => Promise<boolean>;
}) {
  const t = useTranslations("AuthJourney");
  const form = useFormContext<CompleteOwnerBusinessInput>();
  const slugEdited = useRef(false);
  const lastSuggestedSlug = useRef("");
  function contactError(
    status: BusinessNameAvailabilityStatus,
    field: "username" | "phone",
  ) {
    return status === "unavailable"
      ? t(`availability.${field}Taken`)
      : status === "error"
        ? t("availability.failed")
        : status === "invalid"
          ? t(field === "phone" ? "invalidPhone" : "invalidField")
          : undefined;
  }
  const categories = useQuery({
    queryKey: ["business-categories", "active"],
    queryFn: businessCategoriesService.listActive,
    staleTime: 5 * 60 * 1000,
  });
  const fieldError = form.getFieldState("slug", form.formState).error?.message;
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
        error={form.formState.errors.name?.message}
        required
      >
        <Input
          id="name"
          type="text"
          placeholder={t("placeholders.businessName")}
          {...form.register("name", {
            onChange: (event) => {
              if (
                !slugEdited.current &&
                form.getValues("slug") === lastSuggestedSlug.current
              ) {
                const suggested = createBusinessSlug(event.target.value);
                lastSuggestedSlug.current = suggested;
                form.setValue("slug", suggested, {
                  shouldDirty: false,
                });
              }
            },
          })}
        />
      </FormField>
      <FormField
        htmlFor="business-slug"
        label={t("companyLogin")}
        error={fieldError || statusError}
        description={statusMessage || t("companyLoginHint")}
        descriptionRole="status"
        descriptionClassName={
          businessNameStatus === "error" ? "text-destructive" : undefined
        }
        required
      >
        <div
          className={`flex min-w-0 flex-wrap items-center overflow-hidden rounded-lg border bg-card focus-within:ring-2 focus-within:ring-ring sm:flex-nowrap ${hasStatusError ? "border-destructive" : "border-input"}`}
        >
          <span
            aria-hidden="true"
            className="shrink-0 px-2 text-xs text-muted-foreground sm:px-3 sm:text-sm"
          >
            https://
          </span>
          <div className="relative min-w-0 flex-1">
            <Input
              id="business-slug"
              type="text"
              placeholder={t("companyLoginPlaceholder")}
              className="min-w-0 rounded-none border-0 pr-8 shadow-none focus-visible:ring-0"
              maxLength={80}
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={hasStatusError}
              aria-required="true"
              aria-describedby="business-slug-description"
              {...form.register("slug", {
                onChange: () => {
                  slugEdited.current = true;
                },
                onBlur: () => void onCheckBusinessName(),
              })}
            />
            {statusIcon ? (
              <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                {statusIcon}
              </span>
            ) : null}
          </div>
          <span
            aria-hidden="true"
            className="w-full shrink-0 border-t border-border bg-muted px-3 py-2 text-sm text-muted-foreground sm:w-auto sm:self-stretch sm:content-center sm:border-t-0"
          >
            .{siteConfig.bookingDomain}
          </span>
        </div>
      </FormField>
      <BusinessOnboardingField
        name="owner.username"
        label="username"
        onBlur={() => void onCheckUsername()}
        availabilityError={contactError(usernameStatus, "username")}
        availabilityHint={
          usernameStatus === "checking" && !disabled
            ? t("availability.checking")
            : undefined
        }
      />
      <FormField
        htmlFor="owner-phone"
        label={t("phone")}
        error={
          form.formState.errors.owner?.phone?.message ||
          contactError(phoneStatus, "phone")
        }
        description={
          phoneStatus === "checking" && !disabled
            ? t("availability.checking")
            : undefined
        }
        descriptionRole="status"
      >
        <Controller
          control={form.control}
          name="owner.phone"
          render={({ field }) => (
            <PhoneNumberInput
              {...field}
              id="owner-phone"
              key={phoneCountry}
              invalid={
                Boolean(form.formState.errors.owner?.phone) ||
                phoneStatus === "unavailable" ||
                phoneStatus === "invalid" ||
                phoneStatus === "error"
              }
              placeholder={t("placeholders.phone")}
              defaultCountry={phoneCountry}
              value={field.value || undefined}
              onChange={(value: string | undefined) => {
                field.onChange(value);
                form.clearErrors("owner.phone");
              }}
              onBlur={() => {
                field.onBlur();
                void onCheckPhone();
              }}
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
