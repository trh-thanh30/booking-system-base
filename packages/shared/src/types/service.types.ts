import type { SERVICE_STATUSES } from "../constants/index.ts";
import type { CategorySummary } from "./category.types.ts";

export type ServiceStatus = (typeof SERVICE_STATUSES)[number];

export type ServiceSummary = {
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
  status: ServiceStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ServiceDetail = ServiceSummary & {
  category: CategorySummary | null;
};
