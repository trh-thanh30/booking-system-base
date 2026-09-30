-- CreateEnum
CREATE TYPE "identity_provider" AS ENUM ('GOOGLE');

-- CreateTable
CREATE TABLE "user_identity" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "provider" "identity_provider" NOT NULL,
  "provider_account_id" TEXT NOT NULL,
  "provider_email" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "user_identity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_identity_provider_provider_account_id_key"
  ON "user_identity"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_identity_user_id_provider_key"
  ON "user_identity"("user_id", "provider");

-- CreateIndex
CREATE INDEX "user_identity_user_id_idx" ON "user_identity"("user_id");

-- AddForeignKey
ALTER TABLE "user_identity"
  ADD CONSTRAINT "user_identity_user_id_fkey"
  FOREIGN KEY ("user_id") REFERENCES "user"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
