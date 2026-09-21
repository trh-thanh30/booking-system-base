import type { CATEGORY_STATUSES, CATEGORY_TYPES } from "../constants/index.ts";

export type CategoryType = (typeof CATEGORY_TYPES)[number];

export type CategoryStatus = (typeof CATEGORY_STATUSES)[number];

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
  parent_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
