import { z } from "zod";
import { ASSET_ACCESS_TYPES, ASSET_TYPES } from "../constants/index.ts";
import { paginationQuerySchema } from "./pagination.schema.ts";

export const uploadAssetSchema = z.object({
  folder: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  entityType: z.string().max(50).optional(),
  accessType: z.enum(ASSET_ACCESS_TYPES).optional(),
  type: z.string().max(20).optional(),
});

export type UploadAssetInput = z.infer<typeof uploadAssetSchema>;

export const listAssetsSchema = paginationQuerySchema.extend({
  uploadedById: z.string().uuid().optional(),
  type: z.enum(ASSET_TYPES).optional(),
  accessType: z.enum(ASSET_ACCESS_TYPES).optional(),
  folder: z.string().optional(),
});

export type ListAssetsQuery = z.input<typeof listAssetsSchema>;
