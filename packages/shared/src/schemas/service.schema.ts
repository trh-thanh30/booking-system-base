import { z } from "zod";
import {
  DEFAULT_SERVICE_CURRENCY,
  SERVICE_STATUSES,
} from "../constants/index.ts";

const mutableServiceStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const serviceStatusSchema = z.enum(SERVICE_STATUSES);

export const createServiceSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
  description: z.string().max(2000).nullable().optional(),
  duration_minutes: z.number().int().min(1).max(1440),
  buffer_before_minutes: z.number().int().min(0).max(240).optional(),
  buffer_after_minutes: z.number().int().min(0).max(240).optional(),
  price_amount: z.number().int().min(0),
  currency: z.string().trim().length(3).default(DEFAULT_SERVICE_CURRENCY),
  status: mutableServiceStatusSchema.optional(),
  sort_order: z.number().int().min(0).optional(),
});

export type CreateServiceInput = z.input<typeof createServiceSchema>;

export const updateServiceSchema = z.object({
  category_id: z.string().uuid().nullable().optional(),
  name: z.string().trim().min(1).max(160).optional(),
  slug: z.string().trim().min(1).max(180).optional(),
  description: z.string().max(2000).nullable().optional(),
  duration_minutes: z.number().int().min(1).max(1440).optional(),
  buffer_before_minutes: z.number().int().min(0).max(240).optional(),
  buffer_after_minutes: z.number().int().min(0).max(240).optional(),
  price_amount: z.number().int().min(0).optional(),
  currency: z.string().trim().length(3).optional(),
  status: mutableServiceStatusSchema.optional(),
  sort_order: z.number().int().min(0).optional(),
});

export type UpdateServiceInput = z.input<typeof updateServiceSchema>;

export const listServicesSchema = z.object({
  search: z.string().trim().min(1).max(160).optional(),
  category_id: z.string().uuid().nullable().optional(),
  status: serviceStatusSchema.optional(),
  include_archived: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListServicesInput = z.input<typeof listServicesSchema>;
