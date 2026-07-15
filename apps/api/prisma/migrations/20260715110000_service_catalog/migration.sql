CREATE TYPE "service_status" AS ENUM (
  'ACTIVE',
  'INACTIVE',
  'ARCHIVED'
);

CREATE TABLE "service" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "tenant_id" UUID NOT NULL,
  "business_id" UUID NOT NULL,
  "category_id" UUID,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT,
  "duration_minutes" INTEGER NOT NULL,
  "buffer_before_minutes" INTEGER NOT NULL DEFAULT 0,
  "buffer_after_minutes" INTEGER NOT NULL DEFAULT 0,
  "price_amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'VND',
  "status" "service_status" NOT NULL DEFAULT 'ACTIVE',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "service_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "service_tenant_id_business_id_slug_key"
  ON "service"("tenant_id", "business_id", "slug");

CREATE INDEX "service_tenant_id_business_id_idx"
  ON "service"("tenant_id", "business_id");

CREATE INDEX "service_business_id_category_id_idx"
  ON "service"("business_id", "category_id");

CREATE INDEX "service_business_id_status_idx"
  ON "service"("business_id", "status");

ALTER TABLE "service"
  ADD CONSTRAINT "service_tenant_id_fkey"
  FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "service"
  ADD CONSTRAINT "service_business_id_fkey"
  FOREIGN KEY ("business_id") REFERENCES "business"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "service"
  ADD CONSTRAINT "service_category_id_fkey"
  FOREIGN KEY ("category_id") REFERENCES "category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
