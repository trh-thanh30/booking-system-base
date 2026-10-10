import { Injectable } from '@nestjs/common';
import type { BusinessSetupSummary } from '@repo/shared';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import {
  requireBusinessSettings,
  savedWorkingDays,
  selectedTemplateId,
  settingsObject,
} from '../utils/business-settings.util';

@Injectable()
export class GetSetupSummaryUseCase {
  constructor(
    private readonly repository: BusinessSettingsRepository,
    private readonly services: ServiceRepository,
  ) {}

  async execute(
    tenantId: string,
    businessId: string,
  ): Promise<BusinessSetupSummary> {
    const business = await requireBusinessSettings(
      this.repository,
      tenantId,
      businessId,
    );
    const templateId = selectedTemplateId(business.settings);
    const steps = {
      working_hours: savedWorkingDays(business.settings) !== null,
      first_service: await this.services.hasActiveInBusiness(
        tenantId,
        businessId,
      ),
      booking_template: templateId !== null,
    };
    const completed = Object.values(steps).filter(Boolean).length;
    const skipped =
      settingsObject(business.settings).quick_setup_skipped === true;
    return {
      status:
        completed === 3
          ? 'COMPLETED'
          : skipped
            ? 'SKIPPED'
            : completed > 0
              ? 'IN_PROGRESS'
              : 'NOT_STARTED',
      next_step: !steps.working_hours
        ? 'WORKING_HOURS'
        : !steps.first_service
          ? 'FIRST_SERVICE'
          : !steps.booking_template
            ? 'BOOKING_TEMPLATE'
            : null,
      timezone: business.timezone,
      selected_template_id: templateId,
      steps,
      completed_steps: completed,
      total_steps: 3,
    };
  }
}
