ALTER TABLE "asset_link"
ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0;

CREATE INDEX "asset_link_entity_id_entity_type_sort_order_idx"
ON "asset_link"("entity_id", "entity_type", "sort_order");

-- Older uploads did not persist the uploader's tenant on the asset record.
UPDATE "asset" AS asset
SET "tenant_id" = uploader."tenant_id"
FROM "user" AS uploader
WHERE asset."uploaded_by_id" = uploader."id"
  AND asset."tenant_id" IS NULL
  AND uploader."tenant_id" IS NOT NULL;
