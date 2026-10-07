"use client";

import type {
  CompleteGoogleOwnerOnboardingInput,
  GoogleOnboardingProfile,
} from "@repo/shared";
import { BusinessOnboardingForm } from "./business-onboarding";

export function GoogleBusinessForm({
  profile,
  locale,
  isPending,
  onSubmit,
  onDraftStateChange,
}: {
  profile: GoogleOnboardingProfile;
  locale: string;
  isPending: boolean;
  onSubmit: (input: CompleteGoogleOwnerOnboardingInput) => Promise<void>;
  onDraftStateChange?: (hasDraft: boolean, clearDraft: () => void) => void;
}) {
  return (
    <BusinessOnboardingForm
      profile={profile}
      locale={locale}
      isPending={isPending}
      onSubmit={onSubmit}
      onDraftStateChange={onDraftStateChange}
    />
  );
}
