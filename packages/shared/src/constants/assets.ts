export const ASSET_TYPES = [
  "IMAGE",
  "VIDEO",
  "AUDIO",
  "DOCUMENT",
  "OTHER",
  "THUMBNAIL",
  "BANNER",
] as const;

export const ASSET_ACCESS_TYPES = ["PUBLIC", "PRIVATE", "TEMP"] as const;

export const CATEGORY_ASSET_ENTITY_TYPE = "CATEGORY" as const;
export const MAX_CATEGORY_ASSETS = 10;
