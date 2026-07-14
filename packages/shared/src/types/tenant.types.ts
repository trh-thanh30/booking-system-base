import type {
  TENANT_DOMAIN_TYPES,
  TENANT_STATUSES,
} from "../constants/index.ts";

export type TenantStatus = (typeof TENANT_STATUSES)[number];

export type TenantDomainType = (typeof TENANT_DOMAIN_TYPES)[number];

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

export type TenantListItem = TenantContext & {
  created_at: string;
  updated_at: string;
  users_count: number;
};

export type TenantSignupResult = {
  tenant: TenantContext;
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
