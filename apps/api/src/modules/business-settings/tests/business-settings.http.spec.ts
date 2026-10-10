import { Test } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import request from 'supertest';
import type { Request, Response, NextFunction } from 'express';
import {
  business_status,
  tenant_status,
  user_role,
  user_status,
} from '@prisma/client';
import { BusinessSettingsModule } from '../business-settings.module';
import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import { PrismaService } from '@/database/prisma/prisma.service';
import { BusinessRepository } from '@/modules/business/repository/business.repository';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import { BusinessGuard } from '@/common/guards/business.guard';
import { TenantGuard } from '@/common/guards/tenant.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { AllExceptionsFilter } from '@/common/filters/all-exceptions.filter';
import { ResponseInterceptor } from '@/common/interceptors/response.interceptor';
import type { LoggerService } from '@/common/logger/logger.service';

const tenantId = '11111111-1111-4111-8111-111111111111';
const businessId = '22222222-2222-4222-8222-222222222222';
const inaccessibleId = '33333333-3333-4333-8333-333333333333';
const days = Array.from({ length: 7 }, (_, day_of_week) => ({
  day_of_week,
  is_closed: false,
  opens_at: '09:00',
  closes_at: '17:00',
}));

describe('Business settings HTTP boundary', () => {
  let app: INestApplication;
  let role: user_role;
  let business: {
    id: string;
    tenant_id: string;
    timezone: string;
    settings: Record<string, unknown>;
  };
  let activeService: boolean;
  const patchSettings = jest.fn();

  beforeAll(async () => {
    const repository = {
      findInTenant: jest
        .fn()
        .mockImplementation((tenant, id) =>
          Promise.resolve(
            tenant === tenantId && id === businessId ? business : null,
          ),
        ),
      patchSettings: patchSettings.mockImplementation((tenant, id, patch) => {
        if (tenant !== tenantId || id !== businessId)
          throw new Error('Unexpected scope');
        business.settings = { ...business.settings, ...patch };
        return Promise.resolve(business);
      }),
    };
    const businessRepository = {
      findAccessibleById: jest.fn().mockImplementation((id, tenant) =>
        Promise.resolve(
          id === businessId && tenant === tenantId
            ? {
                ...business,
                slug: 'salon',
                name: 'Salon',
                locale: 'vi',
                status: business_status.ACTIVE,
                is_default: true,
                created_at: new Date(),
                updated_at: new Date(),
              }
            : null,
        ),
      ),
    };
    const module = await Test.createTestingModule({
      imports: [BusinessSettingsModule],
      providers: [
        { provide: BusinessRepository, useValue: businessRepository },
        RolesGuard,
        TenantGuard,
        BusinessGuard,
      ],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(BusinessSettingsRepository)
      .useValue(repository)
      .overrideProvider(ServiceRepository)
      .useValue({
        hasActiveInBusiness: jest
          .fn()
          .mockImplementation(() => Promise.resolve(activeService)),
      })
      .compile();
    app = module.createNestApplication();
    app.use((req: Request, _res: Response, next: NextFunction) => {
      const currentUser = {
        id: 'owner-1',
        tenant_id: tenantId,
        role,
        auth_context: 'admin',
        email: 'owner@example.com',
        username: 'owner',
        password: null,
        full_name: 'Owner',
        phone: null,
        avatar_url: null,
        status: user_status.ACTIVE,
        is_verified: true,
        refresh_token_hash: null,
        created_at: new Date(),
        updated_at: new Date(),
      };
      req.user = currentUser;
      req.tenant = {
        id: tenantId,
        slug: 'salon',
        name: 'Salon',
        status: tenant_status.ACTIVE,
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi',
        settings: {},
        domains: [],
      };
      next();
    });
    app.useGlobalGuards(
      module.get(RolesGuard),
      module.get(TenantGuard),
      module.get(BusinessGuard),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
      }),
    );
    const logger = {
      warn: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
    } as unknown as LoggerService;
    app.useGlobalFilters(new AllExceptionsFilter(logger, logger));
    app.useGlobalInterceptors(new ResponseInterceptor(module.get(Reflector)));
    await app.init();
  });

  beforeEach(() => {
    role = user_role.OWNER;
    business = {
      id: businessId,
      tenant_id: tenantId,
      timezone: 'Asia/Ho_Chi_Minh',
      settings: { business_profile: { country: 'VN' } },
    };
    activeService = false;
    patchSettings.mockClear();
  });

  afterAll(async () => {
    await app?.close();
  });

  it('saves the three steps and reloads COMPLETED using the backend', async () => {
    const server = app.getHttpServer();
    const initial = await request(server)
      .get('/business-settings/setup-summary')
      .set('x-business-id', businessId)
      .expect(200);
    expect(initial.body).toMatchObject({
      success: true,
      data: { status: 'NOT_STARTED', next_step: 'WORKING_HOURS' },
    });
    await request(server)
      .put('/business-settings/working-hours')
      .set('x-business-id', businessId)
      .send({ days })
      .expect(200);
    activeService = true; // Existing ServiceModule owns creation; summary observes its active-service query.
    await request(server)
      .put('/business-settings/booking-template')
      .set('x-business-id', businessId)
      .send({ template_id: 'modern' })
      .expect(200);
    const reloaded = await request(server)
      .get('/business-settings/setup-summary')
      .set('x-business-id', businessId)
      .expect(200);
    expect(reloaded.body.data).toMatchObject({
      status: 'COMPLETED',
      next_step: null,
      completed_steps: 3,
    });
    expect(business.settings.business_profile).toEqual({ country: 'VN' });
  });

  it.each([
    ['put', '/working-hours', { days }],
    ['put', '/booking-template', { template_id: 'classic' }],
    ['post', '/skip', {}],
    ['post', '/resume', {}],
  ])('rejects Staff mutation %s %s', async (method, path, body) => {
    role = user_role.STAFF;
    await request(app.getHttpServer())
      [method](`/business-settings${path}`)
      .set('x-business-id', businessId)
      .send(body)
      .expect(403);
    expect(patchSettings).not.toHaveBeenCalled();
  });

  it('allows Staff to read an accessible Business summary', async () => {
    role = user_role.STAFF;
    await request(app.getHttpServer())
      .get('/business-settings/setup-summary')
      .set('x-business-id', businessId)
      .expect(200);
  });

  it.each(['/setup-summary', '/working-hours', '/booking-templates'])(
    'rejects a Business outside the current Tenant: %s',
    async (path) => {
      await request(app.getHttpServer())
        .get(`/business-settings${path}`)
        .set('x-business-id', inaccessibleId)
        .expect(403);
    },
  );

  it('rejects cross-Tenant writes before calling the use case', async () => {
    await request(app.getHttpServer())
      .put('/business-settings/working-hours')
      .set('x-business-id', inaccessibleId)
      .send({ days })
      .expect(403);
    expect(patchSettings).not.toHaveBeenCalled();
  });

  it.each([
    { days, business_id: inaccessibleId },
    { days, tenant_id: inaccessibleId },
    { days, timezone: 'UTC' },
    { days: days.slice(1) },
    { days: days.map((day) => ({ ...day, closes_at: '08:00' })) },
    {
      days: days.map((day) =>
        day.day_of_week === 0 ? { ...day, day_of_week: '0' } : day,
      ),
    },
    {
      days: days.map((day) =>
        day.day_of_week === 0
          ? { ...day, is_closed: 'false', opens_at: null, closes_at: null }
          : day,
      ),
    },
  ])('rejects malformed or spoofed hours: %j', async (body) => {
    const response = await request(app.getHttpServer())
      .put('/business-settings/working-hours')
      .set('x-business-id', businessId)
      .send(body)
      .expect(400);
    expect(response.body.success).toBe(false);
    expect(patchSettings).not.toHaveBeenCalled();
  });

  it('returns an API error for an invalid template', async () => {
    const response = await request(app.getHttpServer())
      .put('/business-settings/booking-template')
      .set('x-business-id', businessId)
      .send({ template_id: 'unknown' })
      .expect(400);
    expect(response.body).toMatchObject({
      success: false,
      error: { code: 'BAD_REQUEST' },
    });
  });

  it('skip and resume preserve saved hours and restore the next step', async () => {
    const server = app.getHttpServer();
    await request(server)
      .put('/business-settings/working-hours')
      .set('x-business-id', businessId)
      .send({ days })
      .expect(200);
    const skipped = await request(server)
      .post('/business-settings/skip')
      .set('x-business-id', businessId)
      .expect(200);
    expect(skipped.body.data.status).toBe('SKIPPED');
    const loaded = await request(server)
      .get('/business-settings/setup-summary')
      .set('x-business-id', businessId)
      .expect(200);
    expect(loaded.body.data.status).toBe('SKIPPED');
    const resumed = await request(server)
      .post('/business-settings/resume')
      .set('x-business-id', businessId)
      .expect(200);
    expect(resumed.body.data).toMatchObject({
      status: 'IN_PROGRESS',
      next_step: 'FIRST_SERVICE',
    });
    expect(business.settings.working_hours).toEqual(days);
  });
});
