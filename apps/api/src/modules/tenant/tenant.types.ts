import type {
  TenantContext,
  TenantDomainSummary,
  TenantSettings,
  TenantSummary,
} from '@/common/types/tenant-context.types';
import { tenant_domain_type, tenant_status, type Prisma } from '@prisma/client';

export type TenantWithContext = Prisma.TenantGetPayload<{
  include: {
    businesses: true;
    domains: true;
    settings: true;
  };
}>;

export type TenantWithListContext = Prisma.TenantGetPayload<{
  include: {
    businesses: true;
    domains: true;
    settings: true;
    _count: {
      select: {
        businesses: true;
        users: true;
      };
    };
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

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function toTenantSettings(value: unknown): TenantSettings {
  if (isObjectRecord(value)) {
    return { ...value };
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

export function toTenantListItem(tenant: TenantWithListContext) {
  return {
    ...toTenantContext(tenant),
    created_at: tenant.created_at,
    updated_at: tenant.updated_at,
    businesses_count: tenant._count.businesses,
    users_count: tenant._count.users,
  };
}
