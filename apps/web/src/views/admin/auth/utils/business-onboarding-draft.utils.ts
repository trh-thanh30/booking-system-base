import type { CompleteOwnerBusinessInput } from "@repo/shared";
import { z } from "zod";
import {
  BUSINESS_ONBOARDING_DRAFT_STORAGE_KEY,
  BUSINESS_ONBOARDING_DRAFT_TTL_MS,
  BUSINESS_ONBOARDING_DRAFT_VERSION,
} from "../constants/business-onboarding-draft.constants";
import type { BusinessOnboardingStep } from "../types/business-onboarding.types";

const draftValuesSchema = z.object({
  business_category_id: z.string(),
  name: z.string(),
  slug: z.string(),
  owner: z.object({
    username: z.string(),
    phone: z.string().optional(),
  }),
  timezone: z.string(),
  locale: z.enum(["vi", "en"]),
  business_profile: z.object({
    address: z.object({
      countryCode: z.string(),
      addressLine1: z.string(),
      addressLine2: z.string().optional(),
      locality: z.string(),
      administrativeAreaLevel1: z.string().optional(),
      administrativeAreaLevel2: z.string().optional(),
      postalCode: z.string().optional(),
      formattedAddress: z.string().optional(),
      location: z
        .object({
          latitude: z.number().finite(),
          longitude: z.number().finite(),
        })
        .nullable(),
    }),
  }),
});

const businessOnboardingDraftSchema = z.object({
  version: z.literal(BUSINESS_ONBOARDING_DRAFT_VERSION),
  profileEmail: z.string().trim().toLowerCase(),
  step: z
    .union([z.literal(0), z.literal(1), z.literal(2)])
    .transform((step): BusinessOnboardingStep => (step === 2 ? 1 : step)),
  values: draftValuesSchema,
  updatedAt: z.number().int().nonnegative(),
  expiresAt: z.number().int().positive(),
});

export type BusinessOnboardingDraft = z.infer<
  typeof businessOnboardingDraftSchema
>;

type BusinessOnboardingDraftStorage = Pick<
  Storage,
  "getItem" | "setItem" | "removeItem"
>;

export function createBusinessOnboardingDraft({
  profileEmail,
  step,
  values,
  now = Date.now(),
}: {
  profileEmail: string;
  step: BusinessOnboardingStep;
  values: CompleteOwnerBusinessInput;
  now?: number;
}): BusinessOnboardingDraft {
  return {
    version: BUSINESS_ONBOARDING_DRAFT_VERSION,
    profileEmail: profileEmail.trim().toLowerCase(),
    step,
    values,
    updatedAt: now,
    expiresAt: now + BUSINESS_ONBOARDING_DRAFT_TTL_MS,
  };
}

export function parseBusinessOnboardingDraft(
  raw: string,
  profileEmail: string,
  now = Date.now(),
): BusinessOnboardingDraft | null {
  try {
    const parsed = businessOnboardingDraftSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return null;
    if (parsed.data.profileEmail !== profileEmail.trim().toLowerCase()) {
      return null;
    }
    if (parsed.data.expiresAt <= now) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function saveBusinessOnboardingDraft(
  storage: BusinessOnboardingDraftStorage,
  draft: BusinessOnboardingDraft,
): boolean {
  try {
    storage.setItem(
      BUSINESS_ONBOARDING_DRAFT_STORAGE_KEY,
      JSON.stringify(draft),
    );
    return true;
  } catch {
    return false;
  }
}

export function loadBusinessOnboardingDraft(
  storage: BusinessOnboardingDraftStorage,
  profileEmail: string,
  now = Date.now(),
): BusinessOnboardingDraft | null {
  try {
    const raw = storage.getItem(BUSINESS_ONBOARDING_DRAFT_STORAGE_KEY);
    if (!raw) return null;
    const draft = parseBusinessOnboardingDraft(raw, profileEmail, now);
    if (!draft) {
      const parsed = businessOnboardingDraftSchema.safeParse(JSON.parse(raw));
      const shouldRemove = !parsed.success || parsed.data.expiresAt <= now;
      if (shouldRemove) {
        storage.removeItem(BUSINESS_ONBOARDING_DRAFT_STORAGE_KEY);
      }
    }
    return draft;
  } catch {
    clearBusinessOnboardingDraft(storage);
    return null;
  }
}

export function clearBusinessOnboardingDraft(
  storage: BusinessOnboardingDraftStorage,
): void {
  try {
    storage.removeItem(BUSINESS_ONBOARDING_DRAFT_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}
