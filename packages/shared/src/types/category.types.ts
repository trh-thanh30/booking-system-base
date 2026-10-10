import type { CATEGORY_STATUSES, CATEGORY_TYPES } from "../constants/index.ts";

export type CategoryType = (typeof CATEGORY_TYPES)[number];

export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

export type CategoryParentSummary = {
  id: string;
  name: string;
  slug: string;
};

export type CategoryAssetSummary = {
  id: string;
  original_name: string;
  mime_type: string;
  sort_order: number;
  url: string;
};

export type CategorySummary = {
  id: string;
  tenant_id: string;
  business_id: string | null;
  type: CategoryType;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  sort_order: number;
  service_count: number;
  children_count: number;
  parent_id: string | null;
  parent: CategoryParentSummary | null;
  assets: CategoryAssetSummary[];
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
