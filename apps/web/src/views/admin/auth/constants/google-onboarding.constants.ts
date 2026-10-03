export const GOOGLE_ONBOARDING_QUERY_KEY = [
  "admin",
  "auth",
  "google-onboarding",
] as const;

export const GOOGLE_ONBOARDING_FIELDS = [
  {
    name: "owner.username",
    id: "owner-username",
    label: "username",
    autoComplete: "username",
  },
  {
    name: "owner.phone",
    id: "owner-phone",
    label: "phone",
    autoComplete: "tel",
  },
  {
    name: "name",
    id: "tenant-name",
    label: "tenantName",
    autoComplete: "organization",
  },
  { name: "slug", id: "tenant-slug", label: "tenantSlug", autoComplete: "off" },
  {
    name: "default_business_name",
    id: "business-name",
    label: "businessName",
    autoComplete: "off",
  },
  {
    name: "default_business_slug",
    id: "business-slug",
    label: "businessSlug",
    autoComplete: "off",
  },
  { name: "timezone", id: "timezone", label: "timezone", autoComplete: "off" },
  {
    name: "primary_domain",
    id: "primary-domain",
    label: "primaryDomain",
    autoComplete: "off",
  },
] as const;
