import { Injectable } from '@nestjs/common';
import type { BusinessWorkingHours } from '@repo/shared';
import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import {
  requireBusinessSettings,
  savedWorkingDays,
} from '../utils/business-settings.util';

@Injectable()
export class GetWorkingHoursUseCase {
  constructor(private readonly repository: BusinessSettingsRepository) {}

  async execute(
    tenantId: string,
    businessId: string,
  ): Promise<BusinessWorkingHours> {
    const business = await requireBusinessSettings(
      this.repository,
      tenantId,
      businessId,
    );
    return {
      timezone: business.timezone,
      days: savedWorkingDays(business.settings),
    };
  }
}
