import { Injectable } from '@nestjs/common';
import { updateBusinessWorkingHoursSchema } from '@repo/shared';
import type { BusinessWorkingHours } from '@repo/shared';
import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import { parseSettingsInput } from '../utils/business-settings.util';

@Injectable()
export class UpdateWorkingHoursUseCase {
  constructor(private readonly repository: BusinessSettingsRepository) {}

  async execute(
    tenantId: string,
    businessId: string,
    input: unknown,
  ): Promise<BusinessWorkingHours> {
    const { days } = parseSettingsInput(
      updateBusinessWorkingHoursSchema,
      input,
    );
    days.sort((a, b) => a.day_of_week - b.day_of_week);
    const business = await this.repository.patchSettings(tenantId, businessId, {
      working_hours: days,
    });
    return { timezone: business.timezone, days };
  }
}
