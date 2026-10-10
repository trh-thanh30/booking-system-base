/* Run after build: pnpm --filter @repo/api exec node test/business-settings.smoke.cjs
 * Uses .env.development and removes its disposable Tenant and child records.
 */
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const {
  BusinessSettingsRepository,
} = require('../dist/modules/business-settings/repository/business-settings.repository');
const {
  ServiceRepository,
} = require('../dist/modules/service/repository/service.repository');
const {
  GetSetupSummaryUseCase,
} = require('../dist/modules/business-settings/use-cases/get-setup-summary.use-case');
const {
  UpdateWorkingHoursUseCase,
} = require('../dist/modules/business-settings/use-cases/update-working-hours.use-case');
const {
  SelectBookingTemplateUseCase,
} = require('../dist/modules/business-settings/use-cases/select-booking-template.use-case');
const {
  SkipBusinessSetupUseCase,
} = require('../dist/modules/business-settings/use-cases/skip-business-setup.use-case');
const {
  ResumeBusinessSetupUseCase,
} = require('../dist/modules/business-settings/use-cases/resume-business-setup.use-case');

async function main() {
  const env = dotenv.parse(
    readFileSync(resolve(__dirname, '../../../.env.development')),
  );
  const pool = new Pool({
    ...(env.DATABASE_URL && !env.DATABASE_URL.includes('${')
      ? { connectionString: env.DATABASE_URL }
      : {
          host: env.DB_HOST || 'localhost',
          port: Number(env.DB_PORT || 5432),
          user: env.DB_USER || 'postgres',
          password: env.DB_PASSWORD || 'postgres',
          database: env.DB_NAME || 'app',
        }),
    connectionTimeoutMillis: 5000,
  });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const tenantId = randomUUID();
  const businessId = randomUUID();
  try {
    await prisma.tenant.create({
      data: {
        id: tenantId,
        name: 'Quick setup smoke',
        slug: `smoke-${tenantId}`,
      },
    });
    await prisma.business.create({
      data: {
        id: businessId,
        tenant_id: tenantId,
        name: 'Smoke Business',
        slug: 'smoke',
        timezone: 'Asia/Singapore',
        settings: { business_profile: { country: 'SG' } },
      },
    });
    const settings = new BusinessSettingsRepository(prisma);
    const services = new ServiceRepository(prisma);
    const summary = new GetSetupSummaryUseCase(settings, services);
    const hours = new UpdateWorkingHoursUseCase(settings);
    const template = new SelectBookingTemplateUseCase(settings);
    const skip = new SkipBusinessSetupUseCase(settings, summary);
    const resume = new ResumeBusinessSetupUseCase(settings, summary);

    assert.equal(
      (await summary.execute(tenantId, businessId)).status,
      'NOT_STARTED',
    );
    const days = Array.from({ length: 7 }, (_, day_of_week) =>
      day_of_week === 0
        ? { day_of_week, is_closed: true, opens_at: null, closes_at: null }
        : {
            day_of_week,
            is_closed: false,
            opens_at: '09:00',
            closes_at: '17:00',
          },
    );
    assert.equal(
      (await hours.execute(tenantId, businessId, { days })).timezone,
      'Asia/Singapore',
    );
    assert.equal(
      (await summary.execute(tenantId, businessId)).next_step,
      'FIRST_SERVICE',
    );
    assert.equal((await skip.execute(tenantId, businessId)).status, 'SKIPPED');
    assert.equal(
      (await resume.execute(tenantId, businessId)).status,
      'IN_PROGRESS',
    );

    const service = await services.create({
      tenant_id: tenantId,
      business_id: businessId,
      name: 'First Service',
      slug: 'first-service',
      duration_minutes: 30,
      price_amount: 100000,
    });
    assert.equal(
      (await summary.execute(tenantId, businessId)).next_step,
      'BOOKING_TEMPLATE',
    );
    await template.execute(tenantId, businessId, { template_id: 'modern' });
    assert.equal(
      (await summary.execute(tenantId, businessId)).status,
      'COMPLETED',
    );
    const saved = await settings.findInTenant(tenantId, businessId);
    assert.deepEqual(saved.settings.business_profile, { country: 'SG' });
    assert.deepEqual(saved.settings.working_hours, days);
    assert.equal(saved.settings.booking_template_id, 'modern');
    assert.equal(saved.settings.quick_setup_skipped, false);

    await prisma.service.update({
      where: { id: service.id },
      data: { status: 'INACTIVE' },
    });
    assert.equal(
      (await summary.execute(tenantId, businessId)).next_step,
      'FIRST_SERVICE',
    );
    await prisma.service.update({
      where: { id: service.id },
      data: { status: 'ARCHIVED' },
    });
    assert.equal(
      (await summary.execute(tenantId, businessId)).steps.first_service,
      false,
    );
    const otherTenant = randomUUID();
    await assert.rejects(summary.execute(otherTenant, businessId), {
      statusCode: 403,
    });
    await assert.rejects(
      settings.patchSettings(otherTenant, businessId, {
        quick_setup_skipped: true,
      }),
      { statusCode: 403 },
    );
    await prisma.business.update({
      where: { id: businessId },
      data: { settings: { business_profile: { country: 'SG' } } },
    });
    await Promise.all([
      hours.execute(tenantId, businessId, { days }),
      template.execute(tenantId, businessId, { template_id: 'modern' }),
      settings.patchSettings(tenantId, businessId, {
        quick_setup_skipped: true,
      }),
    ]);
    const concurrent = await settings.findInTenant(tenantId, businessId);
    assert.deepEqual(concurrent.settings.working_hours, days);
    assert.equal(concurrent.settings.booking_template_id, 'modern');
    assert.equal(concurrent.settings.quick_setup_skipped, true);
    assert.deepEqual(concurrent.settings.business_profile, { country: 'SG' });
  } finally {
    try {
      await prisma.tenant.deleteMany({ where: { id: tenantId } });
      assert.equal(
        await prisma.tenant.findUnique({ where: { id: tenantId } }),
        null,
      );
    } finally {
      await prisma.$disconnect();
      await pool.end();
    }
  }
  console.log(
    'PASS: real PostgreSQL persistence, concurrent ORM writes, active Service detection, Tenant isolation and fixture cleanup',
  );
}

main().catch((error) => {
  console.error('Business settings smoke failed:', error.message);
  process.exitCode = 1;
});
