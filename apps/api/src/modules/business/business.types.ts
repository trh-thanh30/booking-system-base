import type { BusinessContext, BusinessSummary } from '@repo/shared';
import type { business_status, Prisma } from '@prisma/client';

export type BusinessWithContext = Prisma.BusinessGetPayload<
  Record<never, never>
>;

function toBusinessSettings(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return { ...value };
  }

  return {};
}

export function toBusinessSummary(business: {
  id: string;
  tenant_id: string;
  slug: string;
  name: string;
  status: business_status;
  timezone: string;
  locale: string;
  is_default: boolean;
}): BusinessSummary {
  return {
    id: business.id,
    tenant_id: business.tenant_id,
    slug: business.slug,
    name: business.name,
    status: business.status,
    timezone: business.timezone,
    locale: business.locale,
    is_default: business.is_default,
  };
}

export function toBusinessContext(
  business: BusinessWithContext,
): BusinessContext {
  return {
    ...toBusinessSummary(business),
    settings: toBusinessSettings(business.settings),
    created_at: business.created_at.toISOString(),
    updated_at: business.updated_at.toISOString(),
  };
}
