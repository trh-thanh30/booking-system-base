import { BadRequestError, ForbiddenError } from '@/common/response';
import { BOOKING_TEMPLATE_IDS, businessWorkingDaysSchema } from '@repo/shared';
import type { BookingTemplateId } from '@repo/shared';
import type { z } from 'zod';
import type { BusinessSettingsRepository } from '../repository/business-settings.repository';

export async function requireBusinessSettings(
  repository: BusinessSettingsRepository,
  tenantId: string,
  businessId: string,
) {
  const business = await repository.findInTenant(tenantId, businessId);
  if (!business) throw new ForbiddenError('Business is not accessible');
  return business;
}

export function settingsObject(settings: unknown): Record<string, unknown> {
  return settings && typeof settings === 'object' && !Array.isArray(settings)
    ? Object.fromEntries<unknown>(Object.entries(settings))
    : {};
}

export function savedWorkingDays(settings: unknown) {
  const result = businessWorkingDaysSchema.safeParse(
    settingsObject(settings).working_hours,
  );
  return result.success
    ? result.data.sort((a, b) => a.day_of_week - b.day_of_week)
    : null;
}

export function selectedTemplateId(
  settings: unknown,
): BookingTemplateId | null {
  const id = settingsObject(settings).booking_template_id;
  return BOOKING_TEMPLATE_IDS.find((templateId) => templateId === id) ?? null;
}

export function parseSettingsInput<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new BadRequestError(
      result.error.issues.map((issue) => issue.message).join('; '),
      'BUSINESS_SETTINGS_INVALID',
    );
  }
  return result.data;
}
