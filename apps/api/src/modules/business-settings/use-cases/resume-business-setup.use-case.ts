import { Injectable } from '@nestjs/common';
import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import { GetSetupSummaryUseCase } from './get-setup-summary.use-case';

@Injectable()
export class ResumeBusinessSetupUseCase {
  constructor(
    private readonly repository: BusinessSettingsRepository,
    private readonly summary: GetSetupSummaryUseCase,
  ) {}

  async execute(tenantId: string, businessId: string) {
    await this.repository.patchSettings(tenantId, businessId, {
      quick_setup_skipped: false,
    });
    return this.summary.execute(tenantId, businessId);
  }
}
