import type { CategorySummary } from '@repo/shared';
import type { category_status, category_type, Prisma } from '@prisma/client';

export type CategoryWithContext = Prisma.CategoryGetPayload<
  Record<never, never>
>;

function toCategoryMetadata(value: unknown): Record<string, unknown> {
  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
    return { ...value };
  }

  return {};
}

export function toCategorySummary(category: {
  id: string;
  tenant_id: string;
  business_id: string | null;
  type: category_type;
  name: string;
  slug: string;
  description: string | null;
  status: category_status;
  sort_order: number;
  parent_id: string | null;
  metadata: unknown;
  created_at: Date;
  updated_at: Date;
}): CategorySummary {
  return {
    id: category.id,
    tenant_id: category.tenant_id,
    business_id: category.business_id,
    type: category.type,
    name: category.name,
    slug: category.slug,
    description: category.description,
    status: category.status,
    sort_order: category.sort_order,
    parent_id: category.parent_id,
    metadata: toCategoryMetadata(category.metadata),
    created_at: category.created_at.toISOString(),
    updated_at: category.updated_at.toISOString(),
  };
}
