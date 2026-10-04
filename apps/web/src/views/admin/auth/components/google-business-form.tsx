"use client";

import type {
  CompleteGoogleOwnerOnboardingInput,
  GoogleOnboardingProfile,
} from "@repo/shared";
import { BusinessOnboardingForm } from "./business-onboarding-form";

export function GoogleBusinessForm({
  profile,
  locale,
  isPending,
  onSubmit,
}: {
  profile: GoogleOnboardingProfile;
  locale: string;
  isPending: boolean;
  onSubmit: (input: CompleteGoogleOwnerOnboardingInput) => Promise<void>;
}) {
  return (
    <BusinessOnboardingForm
      profile={profile}
      locale={locale}
      isPending={isPending}
      onSubmit={onSubmit}
    />
  );
}
