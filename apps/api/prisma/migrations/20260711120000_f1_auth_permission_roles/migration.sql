-- F1 auth/permission role split.
-- Existing data mapping:
-- ADMIN -> OWNER (tenant-scoped business admin)
-- STAFF -> STAFF
-- USER  -> CUSTOMER
--
-- Create SUPER_ADMIN accounts through seed/manual insert after migration.

-- Alter user_role enum safely by recreating the enum and casting columns.
ALTER TYPE "user_role" RENAME TO "user_role_old";
CREATE TYPE "user_role" AS ENUM ('SUPER_ADMIN', 'OWNER', 'STAFF', 'CUSTOMER');

ALTER TABLE "user"
  ALTER COLUMN "role" DROP DEFAULT,
  ALTER COLUMN "role" TYPE "user_role"
  USING (
    CASE "role"::text
      WHEN 'ADMIN' THEN 'OWNER'
      WHEN 'USER' THEN 'CUSTOMER'
      ELSE "role"::text
    END
  )::"user_role",
  ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

DROP TYPE "user_role_old";

-- CreateTable
CREATE TABLE "permission" (
  "id" UUID NOT NULL,
  "key" TEXT NOT NULL,
  "resource" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_permission" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "permission_id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "granted_by_id" UUID,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invitation" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "role" "user_role" NOT NULL DEFAULT 'STAFF',
  "permission_keys" JSONB,
  "token_hash" TEXT NOT NULL,
  "invited_by_id" UUID,
  "accepted_at" TIMESTAMP(3),
  "expires_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "user_invitation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "permission_key_key" ON "permission"("key");

-- CreateIndex
CREATE UNIQUE INDEX "permission_resource_action_key" ON "permission"("resource", "action");

-- CreateIndex
CREATE INDEX "permission_resource_idx" ON "permission"("resource");

-- CreateIndex
CREATE UNIQUE INDEX "user_permission_user_id_permission_id_tenant_id_key" ON "user_permission"("user_id", "permission_id", "tenant_id");

-- CreateIndex
CREATE INDEX "user_permission_user_id_tenant_id_idx" ON "user_permission"("user_id", "tenant_id");

-- CreateIndex
CREATE INDEX "user_permission_permission_id_idx" ON "user_permission"("permission_id");

-- CreateIndex
CREATE INDEX "user_permission_tenant_id_idx" ON "user_permission"("tenant_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_invitation_token_hash_key" ON "user_invitation"("token_hash");

-- CreateIndex
CREATE INDEX "user_invitation_tenant_id_idx" ON "user_invitation"("tenant_id");

-- CreateIndex
CREATE INDEX "user_invitation_email_idx" ON "user_invitation"("email");

-- CreateIndex
CREATE INDEX "user_invitation_expires_at_idx" ON "user_invitation"("expires_at");

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_permission_id_fkey" FOREIGN KEY ("permission_id") REFERENCES "permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_permission" ADD CONSTRAINT "user_permission_granted_by_id_fkey" FOREIGN KEY ("granted_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitation" ADD CONSTRAINT "user_invitation_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitation" ADD CONSTRAINT "user_invitation_invited_by_id_fkey" FOREIGN KEY ("invited_by_id") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE CASCADE;
