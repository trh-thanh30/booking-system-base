"use client";

import { FormField } from "@/src/components/common";
import type {
  CompleteOwnerBusinessInput,
  GeocodingAddress,
} from "@repo/shared";
import { CountrySelect } from "@repo/ui";
import { useTranslations } from "next-intl";
import { Controller, useFormContext } from "react-hook-form";
import { BusinessLocationMap } from "../business-location-map";
import { BusinessOnboardingField } from "./business-onboarding-field";

export function BusinessAddressStep({
  locale,
  disabled,
}: {
  locale: string;
  disabled: boolean;
}) {
  const t = useTranslations("AuthJourney");
  const form = useFormContext<CompleteOwnerBusinessInput>();
  const address = form.watch("business_profile.address");

  function updateAddress(value: GeocodingAddress) {
    form.setValue("business_profile.address.countryCode", value.countryCode, {
      shouldDirty: true,
    });
    form.setValue("business_profile.address.addressLine1", value.addressLine1, {
      shouldDirty: true,
    });
    form.setValue("business_profile.address.addressLine2", value.addressLine2, {
      shouldDirty: true,
    });
    form.setValue("business_profile.address.locality", value.locality, {
      shouldDirty: true,
    });
    form.setValue(
      "business_profile.address.administrativeAreaLevel1",
      value.administrativeAreaLevel1,
      { shouldDirty: true },
    );
    form.setValue(
      "business_profile.address.administrativeAreaLevel2",
      value.administrativeAreaLevel2,
      { shouldDirty: true },
    );
    form.setValue("business_profile.address.postalCode", value.postalCode, {
      shouldDirty: true,
    });
    form.setValue(
      "business_profile.address.formattedAddress",
      value.formattedAddress,
      { shouldDirty: true },
    );
  }

  return (
    <>
      <FormField
        htmlFor="business-profile-address-countryCode"
        label={t("country")}
        error={
          form.formState.errors.business_profile?.address?.countryCode?.message
        }
        required
      >
        <Controller
          control={form.control}
          name="business_profile.address.countryCode"
          render={({ field }) => (
            <CountrySelect
              id="business-profile-address-countryCode"
              locale={locale}
              value={field.value}
              onChange={(value) => {
                field.onChange(value);
                form.setValue("business_profile.address.formattedAddress", "", {
                  shouldDirty: true,
                });
              }}
              disabled={disabled}
              aria-invalid={Boolean(
                form.formState.errors.business_profile?.address?.countryCode,
              )}
              placeholder={t("placeholders.country")}
              searchPlaceholder={t("placeholders.countrySearch")}
              emptyMessage={t("placeholders.countryEmpty")}
            />
          )}
        />
      </FormField>
      <BusinessOnboardingField
        name="business_profile.address.addressLine1"
        label="addressLine1"
      />
      <BusinessOnboardingField
        name="business_profile.address.addressLine2"
        label="addressLine2"
        required={false}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <BusinessOnboardingField
          name="business_profile.address.locality"
          label="locality"
        />
        <BusinessOnboardingField
          name="business_profile.address.postalCode"
          label="postalCode"
          required={false}
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <BusinessOnboardingField
          name="business_profile.address.administrativeAreaLevel1"
          label="administrativeAreaLevel1"
          required={false}
        />
        <BusinessOnboardingField
          name="business_profile.address.administrativeAreaLevel2"
          label="administrativeAreaLevel2"
          required={false}
        />
      </div>
      <BusinessLocationMap
        value={address.location}
        address={{
          countryCode: address.countryCode,
          addressLine1: address.addressLine1,
          addressLine2: address.addressLine2 ?? "",
          locality: address.locality,
          administrativeAreaLevel1: address.administrativeAreaLevel1 ?? "",
          administrativeAreaLevel2: address.administrativeAreaLevel2 ?? "",
          postalCode: address.postalCode ?? "",
        }}
        disabled={disabled}
        onChange={(value) =>
          form.setValue("business_profile.address.location", value, {
            shouldDirty: true,
          })
        }
        onAddressChange={updateAddress}
        onFormattedAddressChange={(formattedAddress) =>
          form.setValue(
            "business_profile.address.formattedAddress",
            formattedAddress,
            { shouldDirty: true },
          )
        }
      />
      {form.formState.errors.business_profile?.address?.location ? (
        <p role="alert" className="text-sm text-destructive">
          {t("invalidLocation")}
        </p>
      ) : null}
    </>
  );
}
