import { z } from "zod";
import { CATEGORY_STATUSES, CATEGORY_TYPES } from "../constants/index.ts";

export const categoryTypeSchema = z.enum(CATEGORY_TYPES);

export const categoryStatusSchema = z.enum(CATEGORY_STATUSES);

const mutableCategoryStatusSchema = z.enum(["ACTIVE", "INACTIVE"]);

export const createCategorySchema = z.object({
  type: categoryTypeSchema,
  name: z.string().trim().min(1).max(120),
  slug: z.string().trim().min(1).max(140).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: mutableCategoryStatusSchema.optional(),
  sort_order: z.number().int().min(0).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateCategoryInput = z.input<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  slug: z.string().trim().min(1).max(140).optional(),
  description: z.string().max(1000).nullable().optional(),
  status: mutableCategoryStatusSchema.optional(),
  sort_order: z.number().int().min(0).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type UpdateCategoryInput = z.input<typeof updateCategorySchema>;

export const listCategoriesSchema = z.object({
  type: categoryTypeSchema.optional(),
  status: categoryStatusSchema.optional(),
  search: z.string().trim().min(1).max(120).optional(),
  parent_id: z.string().uuid().nullable().optional(),
  include_archived: z.boolean().optional(),
  page: z.number().int().min(1).optional(),
  limit: z.number().int().min(1).max(100).optional(),
});

export type ListCategoriesInput = z.input<typeof listCategoriesSchema>;
