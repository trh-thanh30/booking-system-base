import {
  completeGoogleOwnerOnboardingSchema,
  type CompleteGoogleOwnerOnboardingInput,
} from "@repo/shared";

export function parseGoogleOnboarding(
  input: CompleteGoogleOwnerOnboardingInput,
) {
  return completeGoogleOwnerOnboardingSchema.safeParse({
    ...input,
    name: input.name.trim(),
    slug: input.slug.trim(),
    locale: input.locale === "en" ? "en" : "vi",
    default_business_name: input.default_business_name?.trim() || undefined,
    default_business_slug: input.default_business_slug?.trim() || undefined,
    primary_domain: input.primary_domain?.trim() || undefined,
    owner: {
      ...input.owner,
      username: input.owner.username.trim(),
      phone: input.owner.phone?.trim() || undefined,
    },
  });
}
