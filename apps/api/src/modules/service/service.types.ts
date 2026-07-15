import { toCategorySummary } from '@/modules/category/types/category.types';
import type { ServiceDetail, ServiceSummary } from '@repo/shared';
import type { Prisma, service_status } from '@prisma/client';

export type ServiceWithContext = Prisma.ServiceGetPayload<{
  include: {
    category: true;
  };
}>;

export function toServiceSummary(service: {
  id: string;
  tenant_id: string;
  business_id: string;
  category_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  duration_minutes: number;
  buffer_before_minutes: number;
  buffer_after_minutes: number;
  price_amount: number;
  currency: string;
  status: service_status;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}): ServiceSummary {
  return {
    id: service.id,
    tenant_id: service.tenant_id,
    business_id: service.business_id,
    category_id: service.category_id,
    name: service.name,
    slug: service.slug,
    description: service.description,
    duration_minutes: service.duration_minutes,
    buffer_before_minutes: service.buffer_before_minutes,
    buffer_after_minutes: service.buffer_after_minutes,
    price_amount: service.price_amount,
    currency: service.currency,
    status: service.status,
    sort_order: service.sort_order,
    created_at: service.created_at.toISOString(),
    updated_at: service.updated_at.toISOString(),
  };
}

export function toServiceDetail(service: ServiceWithContext): ServiceDetail {
  return {
    ...toServiceSummary(service),
    category: service.category ? toCategorySummary(service.category) : null,
  };
}
