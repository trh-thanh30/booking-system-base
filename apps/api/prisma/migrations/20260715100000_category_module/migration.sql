CREATE TYPE "category_type" AS ENUM (
  'SERVICE',
  'PRODUCT',
  'EXPENSE',
  'CUSTOMER',
  'CONTENT'
);

CREATE TYPE "category_status" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED'
);

CREATE TABLE "category" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "business_id" UUID,
  "type" "category_type" NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "status" "category_status" NOT NULL DEFAULT 'ACTIVE',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "parent_id" UUID,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "category_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "category_tenant_id_business_id_type_slug_key"
  ON "category"("tenant_id", "business_id", "type", "slug");

CREATE INDEX "category_tenant_id_business_id_type_idx"
  ON "category"("tenant_id", "business_id", "type");

CREATE INDEX "category_type_status_idx"
  ON "category"("type", "status");

CREATE INDEX "category_parent_id_idx"
  ON "category"("parent_id");

ALTER TABLE "category"
  ADD CONSTRAINT "category_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category"
  ADD CONSTRAINT "category_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES "business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "category"
  ADD CONSTRAINT "category_parent_id_fkey"
  FOREIGN KEY ("parent_id") REFERENCES "category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
