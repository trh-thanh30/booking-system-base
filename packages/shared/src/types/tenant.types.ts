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
