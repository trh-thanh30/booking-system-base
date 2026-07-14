-- Multi-business foundation.
-- Tenant becomes the organization/account boundary.
-- Business becomes the operational booking unit under a tenant.

-- CreateEnum
CREATE TYPE "business_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateTable
CREATE TABLE "business" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "business_status" NOT NULL DEFAULT 'ACTIVE',
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  "locale" TEXT NOT NULL DEFAULT 'vi',
  "settings" JSONB,
  "is_default" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "business_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_membership" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "business_id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "business_membership_pkey" PRIMARY KEY ("id")
);

-- Backfill one default business per existing tenant.
INSERT INTO "business" (
  "id",
  "tenant_id",
  "slug",
  "name",
  "status",
  "timezone",
  "locale",
  "settings",
  "is_default",
  "created_at",
  "updated_at"
)
SELECT
  gen_random_uuid(),
  t."id",
  t."slug",
  t."name",
  'ACTIVE',
  t."timezone",
  t."locale",
  COALESCE(ts."settings", '{}'::jsonb),
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "tenant" t
LEFT JOIN "tenant_settings" ts ON ts."tenant_id" = t."id";

-- Backfill owner/staff memberships into their tenant default business.
INSERT INTO "business_membership" (
  "id",
  "tenant_id",
  "business_id",
  "user_id",
  "created_at"
)
SELECT
  gen_random_uuid(),
  u."tenant_id",
  b."id",
  u."id",
  CURRENT_TIMESTAMP
FROM "user" u
JOIN "business" b ON b."tenant_id" = u."tenant_id" AND b."is_default" = true
WHERE u."tenant_id" IS NOT NULL
  AND u."role" IN ('OWNER', 'STAFF');

-- CreateIndex
CREATE UNIQUE INDEX "business_tenant_id_slug_key" ON "business"("tenant_id", "slug");

-- CreateIndex
CREATE INDEX "business_tenant_id_idx" ON "business"("tenant_id");

-- CreateIndex
CREATE INDEX "business_status_idx" ON "business"("status");

-- CreateIndex
CREATE UNIQUE INDEX "business_membership_user_id_business_id_key" ON "business_membership"("user_id", "business_id");

-- CreateIndex
CREATE INDEX "business_membership_tenant_id_user_id_idx" ON "business_membership"("tenant_id", "user_id");

-- CreateIndex
CREATE INDEX "business_membership_business_id_idx" ON "business_membership"("business_id");

-- AddForeignKey
ALTER TABLE "business" ADD CONSTRAINT "business_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_membership" ADD CONSTRAINT "business_membership_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_membership" ADD CONSTRAINT "business_membership_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "business"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_membership" ADD CONSTRAINT "business_membership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
