import type {
  BUSINESS_STATUSES,
  TENANT_DOMAIN_TYPES,
  TENANT_STATUSES,
} from "../constants/index.ts";

export type TenantStatus = (typeof TENANT_STATUSES)[number];

export type TenantDomainType = (typeof TENANT_DOMAIN_TYPES)[number];

export type BusinessStatus = (typeof BUSINESS_STATUSES)[number];

export type TenantSettings = {
  branding?: Record<string, unknown>;
  features?: Record<string, boolean>;
  [key: string]: unknown;
};

export type TenantSummary = {
  id: string;
  slug: string;
  name: string;
  status: TenantStatus;
  timezone: string;
  locale: string;
};

export type TenantDomainSummary = {
  id: string;
  host: string;
  type: TenantDomainType;
  is_primary: boolean;
};

export type TenantContext = TenantSummary & {
  settings: TenantSettings;
  domains: TenantDomainSummary[];
};

export type TenantResolveResult = {
  tenant: TenantSummary;
  domain: TenantDomainSummary;
};

export type BusinessSummary = {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  status: BusinessStatus;
  timezone: string;
  locale: string;
  is_default: boolean;
};

export type BusinessContext = BusinessSummary & {
  settings: TenantSettings;
  created_at: string;
  updated_at: string;
};

export type TenantListItem = TenantContext & {
  created_at: string;
  updated_at: string;
  businesses_count: number;
  users_count: number;
};

export type TenantSignupResult = {
  tenant: TenantContext;
  business: BusinessContext;
  owner: {
    id: string;
    tenant_id: string;
    email: string;
    username: string;
    full_name: string | null;
    role: "OWNER";
    status: "ACTIVE" | "INACTIVE";
    is_verified: boolean;
  };
};
