-- CreateEnum
CREATE TYPE "business_category_status" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateTable
CREATE TABLE "business_category" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "name_vi" TEXT NOT NULL,
  "name_en" TEXT NOT NULL,
  "status" "business_category_status" NOT NULL DEFAULT 'ACTIVE',
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "business_category_pkey" PRIMARY KEY ("id")
);

-- AlterTable
ALTER TABLE "business" ADD COLUMN "business_category_id" UUID;

-- CreateIndex
CREATE UNIQUE INDEX "business_category_slug_key" ON "business_category"("slug");

-- CreateIndex
CREATE INDEX "business_category_status_sort_order_idx"
  ON "business_category"("status", "sort_order");

-- CreateIndex
CREATE INDEX "business_business_category_id_idx"
  ON "business"("business_category_id");

-- AddForeignKey
ALTER TABLE "business"
  ADD CONSTRAINT "business_business_category_id_fkey"
  FOREIGN KEY ("business_category_id") REFERENCES "business_category"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
