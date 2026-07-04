import type { tenant_domain_type, tenant_status } from '@prisma/client';

export type TenantSettings = {
  branding?: Record<string, unknown>;
  features?: Record<string, boolean>;
  [key: string]: unknown;
};

export type TenantSummary = {
  id: string;
  slug: string;
  name: string;
  status: tenant_status;
  timezone: string;
  locale: string;
};

export type TenantDomainSummary = {
  id: string;
  host: string;
  type: tenant_domain_type;
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
