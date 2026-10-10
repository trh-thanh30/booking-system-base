import type {
  CategoryAssetSummary,
  CategoryParentSummary,
  CategorySummary,
} from '@repo/shared';
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
  _count?: {
    children?: number;
    services: number;
  };
  parent_id: string | null;
  parent?: CategoryParentSummary | null;
  assets?: CategoryAssetSummary[];
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
    service_count: category._count?.services ?? 0,
    children_count: category._count?.children ?? 0,
    parent_id: category.parent_id,
    parent: category.parent ?? null,
    assets: category.assets ?? [],
    metadata: toCategoryMetadata(category.metadata),
    created_at: category.created_at.toISOString(),
    updated_at: category.updated_at.toISOString(),
  };
}
