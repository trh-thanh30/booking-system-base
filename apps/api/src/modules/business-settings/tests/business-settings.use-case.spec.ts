import { GetSetupSummaryUseCase } from '../use-cases/get-setup-summary.use-case';
import { GetWorkingHoursUseCase } from '../use-cases/get-working-hours.use-case';
import { UpdateWorkingHoursUseCase } from '../use-cases/update-working-hours.use-case';
import { ListBookingTemplatesUseCase } from '../use-cases/list-booking-templates.use-case';
import { SelectBookingTemplateUseCase } from '../use-cases/select-booking-template.use-case';
import { SkipBusinessSetupUseCase } from '../use-cases/skip-business-setup.use-case';
import { ResumeBusinessSetupUseCase } from '../use-cases/resume-business-setup.use-case';
import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import { ServiceRepository } from '@/modules/service/repository/service.repository';

const tenantId = 'tenant-1';
const businessId = 'business-1';
const days = Array.from({ length: 7 }, (_, day_of_week) => ({
  day_of_week,
  is_closed: false as const,
  opens_at: '09:00',
  closes_at: '17:00',
}));

function harness(
  settings: Record<string, unknown> = {},
  activeService = false,
) {
  const business = { id: businessId, timezone: 'Asia/Ho_Chi_Minh', settings };
  const repository = {
    findInTenant: jest.fn().mockImplementation(() => Promise.resolve(business)),
    patchSettings: jest.fn().mockImplementation((_tenant, _business, patch) => {
      business.settings = { ...business.settings, ...patch };
      return Promise.resolve(business);
    }),
  };
  const services = {
    hasActiveInBusiness: jest.fn().mockResolvedValue(activeService),
  };
  const repo = repository as unknown as BusinessSettingsRepository;
  const serviceRepo = services as unknown as ServiceRepository;
  const summary = new GetSetupSummaryUseCase(repo, serviceRepo);
  return { business, repository, services, repo, summary };
}

describe('Business quick setup use cases', () => {
  it.each([
    [{}, false, 'NOT_STARTED', 'WORKING_HOURS', 0],
    [{ working_hours: days }, false, 'IN_PROGRESS', 'FIRST_SERVICE', 1],
    [{}, true, 'IN_PROGRESS', 'WORKING_HOURS', 1],
    [{ working_hours: days }, true, 'IN_PROGRESS', 'BOOKING_TEMPLATE', 2],
    [{ quick_setup_skipped: true }, false, 'SKIPPED', 'WORKING_HOURS', 0],
    [
      {
        working_hours: days,
        booking_template_id: 'modern',
        quick_setup_skipped: true,
      },
      true,
      'COMPLETED',
      null,
      3,
    ],
  ])(
    'derives summary from real data: %j',
    async (settings, active, status, next, completed) => {
      const h = harness(settings, active);
      const result = await h.summary.execute(tenantId, businessId);
      expect(result).toMatchObject({
        status,
        next_step: next,
        completed_steps: completed,
        total_steps: 3,
        timezone: h.business.timezone,
      });
      expect(h.services.hasActiveInBusiness).toHaveBeenCalledWith(
        tenantId,
        businessId,
      );
      expect(h.repository.findInTenant).toHaveBeenCalledWith(
        tenantId,
        businessId,
      );
    },
  );

  it('does not mark invalid saved settings complete', async () => {
    const h = harness({
      working_hours: days.slice(1),
      booking_template_id: 'unknown',
      quick_setup_skipped: 'true',
    });
    expect(await h.summary.execute(tenantId, businessId)).toMatchObject({
      status: 'NOT_STARTED',
      selected_template_id: null,
      completed_steps: 0,
    });
  });

  it('returns 403 for a Business outside the Tenant', async () => {
    const h = harness();
    h.repository.findInTenant.mockResolvedValue(null);
    await expect(h.summary.execute(tenantId, businessId)).rejects.toMatchObject(
      { statusCode: 403 },
    );
    expect(h.services.hasActiveInBusiness).not.toHaveBeenCalled();
  });

  it('returns Business timezone and no fabricated hours before saving', async () => {
    const h = harness();
    expect(
      await new GetWorkingHoursUseCase(h.repo).execute(tenantId, businessId),
    ).toEqual({ timezone: 'Asia/Ho_Chi_Minh', days: null });
  });

  it('saves seven days and keeps unrelated settings across a fresh summary instance', async () => {
    const h = harness({
      business_profile: { country: 'VN' },
      quick_setup_skipped: true,
    });
    const result = await new UpdateWorkingHoursUseCase(h.repo).execute(
      tenantId,
      businessId,
      { days: [...days].reverse() },
    );
    expect(result).toEqual({ timezone: h.business.timezone, days });
    expect(h.business.settings.business_profile).toEqual({ country: 'VN' });
    expect(h.business.settings.quick_setup_skipped).toBe(true);
    expect(
      await new GetWorkingHoursUseCase(h.repo).execute(tenantId, businessId),
    ).toEqual(result);
  });

  it.each([
    { days: days.slice(1) },
    { days: [...days.slice(1), days[1]] },
    { days: days.map((day) => ({ ...day, closes_at: '09:00' })) },
    { days: days.map((day) => ({ ...day, closes_at: '08:00' })) },
    { days: days.map((day) => ({ ...day, opens_at: '25:00' })) },
    {
      days: days.map((day) => ({
        ...day,
        is_closed: true,
        opens_at: null,
        closes_at: null,
      })),
    },
    { days, timezone: 'UTC' },
    { days, tenant_id: 'another-tenant' },
  ])('rejects invalid hours without saving: %j', async (input) => {
    const h = harness();
    await expect(
      new UpdateWorkingHoursUseCase(h.repo).execute(
        tenantId,
        businessId,
        input,
      ),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(h.repository.patchSettings).not.toHaveBeenCalled();
  });

  it('accepts closed days with null times', async () => {
    const h = harness();
    const schedule = days.map((day) =>
      day.day_of_week === 0
        ? { ...day, is_closed: true, opens_at: null, closes_at: null }
        : day,
    );
    expect(
      await new UpdateWorkingHoursUseCase(h.repo).execute(
        tenantId,
        businessId,
        { days: schedule },
      ),
    ).toMatchObject({ days: schedule });
  });

  it('lists the catalog and persists a valid template', async () => {
    const h = harness();
    const list = new ListBookingTemplatesUseCase(h.repo);
    const catalog = await list.execute(tenantId, businessId);
    expect(catalog.templates.map((template) => template.id)).toEqual([
      'nail-salon-v2',
    ]);
    expect(catalog.selected_template_id).toBeNull();
    await new SelectBookingTemplateUseCase(h.repo).execute(
      tenantId,
      businessId,
      { template_id: 'modern' },
    );
    expect(await list.execute(tenantId, businessId)).toMatchObject({
      selected_template_id: 'modern',
    });
  });

  it('rejects an unknown template', async () => {
    const h = harness();
    await expect(
      new SelectBookingTemplateUseCase(h.repo).execute(tenantId, businessId, {
        template_id: 'unknown',
      }),
    ).rejects.toMatchObject({ statusCode: 400 });
    expect(h.repository.patchSettings).not.toHaveBeenCalled();
  });

  it('persists the nail template and returns it when resuming setup', async () => {
    const h = harness();
    await new SelectBookingTemplateUseCase(h.repo).execute(
      tenantId,
      businessId,
      {
        template_id: 'nail-salon-v2',
      },
    );
    expect(
      await new ListBookingTemplatesUseCase(h.repo).execute(
        tenantId,
        businessId,
      ),
    ).toMatchObject({ selected_template_id: 'nail-salon-v2' });
    expect(await h.summary.execute(tenantId, businessId)).toMatchObject({
      selected_template_id: 'nail-salon-v2',
    });
  });

  it('skip preserves saved data; resume chooses the first incomplete step', async () => {
    const h = harness({
      working_hours: days,
      business_profile: { name: 'Salon' },
    });
    const skip = new SkipBusinessSetupUseCase(h.repo, h.summary);
    const resume = new ResumeBusinessSetupUseCase(h.repo, h.summary);
    expect(await skip.execute(tenantId, businessId)).toMatchObject({
      status: 'SKIPPED',
      next_step: 'FIRST_SERVICE',
    });
    expect(await h.summary.execute(tenantId, businessId)).toMatchObject({
      status: 'SKIPPED',
    });
    expect(await resume.execute(tenantId, businessId)).toMatchObject({
      status: 'IN_PROGRESS',
      next_step: 'FIRST_SERVICE',
    });
    expect(h.business.settings.working_hours).toEqual(days);
    expect(h.business.settings.business_profile).toEqual({ name: 'Salon' });
  });

  it('resume clears skip without inventing completion', async () => {
    const h = harness({ quick_setup_skipped: true });
    expect(
      await new ResumeBusinessSetupUseCase(h.repo, h.summary).execute(
        tenantId,
        businessId,
      ),
    ).toMatchObject({ status: 'NOT_STARTED', next_step: 'WORKING_HOURS' });
  });
});
