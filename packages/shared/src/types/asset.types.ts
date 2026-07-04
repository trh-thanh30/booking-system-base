import type { ASSET_ACCESS_TYPES, ASSET_TYPES } from "../constants/index.ts";

export type AssetType = (typeof ASSET_TYPES)[number];
export type AssetAccessType = (typeof ASSET_ACCESS_TYPES)[number];

export type AssetWithUrl = {
  id: string;
  original_name: string;
  filename: string;
  mime_type: string;
  size: number;
  path: string;
  access_type: AssetAccessType;
  type: AssetType;
  folder: string | null;
  metadata: Record<string, unknown> | null;
  is_deleted: boolean;
  uploaded_by_id: string | null;
  created_at: string | Date;
  updated_at: string | Date;
  url: string;
};
