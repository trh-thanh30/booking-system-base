-- CreateEnum
CREATE TYPE "tenant_status" AS ENUM ('ACTIVE', 'SUSPENDED', 'DISABLED');

-- CreateEnum
CREATE TYPE "tenant_domain_type" AS ENUM ('SUBDOMAIN', 'CUSTOM_DOMAIN', 'INTERNAL');

-- CreateEnum
CREATE TYPE "job_run_status" AS ENUM ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED');

-- AlterTable
ALTER TABLE "user" ADD COLUMN "tenant_id" UUID;

-- AlterTable
ALTER TABLE "asset" ADD COLUMN "tenant_id" UUID;

-- AlterTable
ALTER TABLE "notification" ADD COLUMN "tenant_id" UUID;

-- AlterTable
ALTER TABLE "activity_log" ADD COLUMN "tenant_id" UUID;

-- CreateTable
CREATE TABLE "tenant" (
  "id" UUID NOT NULL,
  "slug" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "status" "tenant_status" NOT NULL DEFAULT 'ACTIVE',
  "timezone" TEXT NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  "locale" TEXT NOT NULL DEFAULT 'vi',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_domain" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "host" TEXT NOT NULL,
  "type" "tenant_domain_type" NOT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tenant_domain_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tenant_settings" (
  "id" UUID NOT NULL,
  "tenant_id" UUID NOT NULL,
  "settings" JSONB NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "tenant_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_run" (
  "id" UUID NOT NULL,
  "tenant_id" UUID,
  "name" TEXT NOT NULL,
  "status" "job_run_status" NOT NULL DEFAULT 'PENDING',
  "started_at" TIMESTAMP(3),
  "finished_at" TIMESTAMP(3),
  "metadata" JSONB,
  "error" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "job_run_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_event" (
  "id" UUID NOT NULL,
  "tenant_id" UUID,
  "type" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "system_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenant_slug_key" ON "tenant"("slug");

-- CreateIndex
CREATE INDEX "tenant_status_idx" ON "tenant"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_domain_host_key" ON "tenant_domain"("host");

-- CreateIndex
CREATE INDEX "tenant_domain_tenant_id_idx" ON "tenant_domain"("tenant_id");

-- CreateIndex
CREATE INDEX "tenant_domain_type_idx" ON "tenant_domain"("type");

-- CreateIndex
CREATE UNIQUE INDEX "tenant_settings_tenant_id_key" ON "tenant_settings"("tenant_id");

-- CreateIndex
CREATE INDEX "job_run_tenant_id_idx" ON "job_run"("tenant_id");

-- CreateIndex
CREATE INDEX "job_run_name_status_idx" ON "job_run"("name", "status");

-- CreateIndex
CREATE INDEX "job_run_created_at_idx" ON "job_run"("created_at");

-- CreateIndex
CREATE INDEX "system_event_tenant_id_idx" ON "system_event"("tenant_id");

-- CreateIndex
CREATE INDEX "system_event_type_idx" ON "system_event"("type");

-- CreateIndex
CREATE INDEX "system_event_created_at_idx" ON "system_event"("created_at");

-- CreateIndex
CREATE INDEX "user_tenant_id_idx" ON "user"("tenant_id");

-- CreateIndex
CREATE INDEX "asset_tenant_id_idx" ON "asset"("tenant_id");

-- CreateIndex
CREATE INDEX "notification_tenant_id_idx" ON "notification"("tenant_id");

-- CreateIndex
CREATE INDEX "activity_log_tenant_id_idx" ON "activity_log"("tenant_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "asset" ADD CONSTRAINT "asset_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification" ADD CONSTRAINT "notification_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_log" ADD CONSTRAINT "activity_log_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_domain" ADD CONSTRAINT "tenant_domain_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenant_settings" ADD CONSTRAINT "tenant_settings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_run" ADD CONSTRAINT "job_run_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_event" ADD CONSTRAINT "system_event_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
