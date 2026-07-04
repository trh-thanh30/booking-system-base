import type {
  TenantContext,
  TenantDomainSummary,
  TenantSettings,
  TenantSummary,
} from '@repo/shared';
import { tenant_domain_type, tenant_status, type Prisma } from '@prisma/client';

export type TenantWithContext = Prisma.TenantGetPayload<{
  include: {
    domains: true;
    settings: true;
  };
}>;

export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/:\d+$/, '');
}

export function toTenantSummary(tenant: {
  id: string;
  slug: string;
  name: string;
  status: tenant_status;
  timezone: string;
  locale: string;
}): TenantSummary {
  return {
    id: tenant.id,
    slug: tenant.slug,
    name: tenant.name,
    status: tenant.status,
    timezone: tenant.timezone,
    locale: tenant.locale,
  };
}

export function toTenantDomainSummary(domain: {
  id: string;
  host: string;
  type: tenant_domain_type;
  is_primary: boolean;
}): TenantDomainSummary {
  return {
    id: domain.id,
    host: domain.host,
    type: domain.type,
    is_primary: domain.is_primary,
  };
}

export function toTenantSettings(value: unknown): TenantSettings {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as TenantSettings;
  }

  return {};
}

export function toTenantContext(tenant: TenantWithContext): TenantContext {
  return {
    ...toTenantSummary(tenant),
    settings: toTenantSettings(tenant.settings?.settings),
    domains: tenant.domains.map(toTenantDomainSummary),
  };
}
