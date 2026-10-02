import { registerOwnerSchema, type RegisterOwnerInput } from "@repo/shared";

export function parseOwnerRegistration(input: RegisterOwnerInput) {
  return registerOwnerSchema.safeParse({
    ...input,
    name: input.name.trim(),
    slug: input.slug.trim(),
    default_business_name: input.default_business_name?.trim() || undefined,
    default_business_slug: input.default_business_slug?.trim() || undefined,
    primary_domain: input.primary_domain?.trim() || undefined,
    owner: {
      ...input.owner,
      username: input.owner.username.trim(),
      email: input.owner.email.trim(),
      full_name: input.owner.full_name?.trim() || undefined,
      phone: input.owner.phone?.trim() || undefined,
    },
  });
}

export function getAdminVerificationUrl(
  baseUrl: string,
  locale: string,
  sessionId: string,
) {
  const url = new URL(baseUrl);
  if (
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password
  )
    throw new Error("Invalid Admin URL");
  url.pathname = `/${locale === "en" ? "en" : "vi"}/verify-email`;
  url.search = new URLSearchParams({ sessionId }).toString();
  url.hash = "";
  return url.toString();
}
