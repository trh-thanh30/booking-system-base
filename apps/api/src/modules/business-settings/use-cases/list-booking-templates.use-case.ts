import { Injectable } from '@nestjs/common';
import { BOOKING_TEMPLATES } from '@repo/shared';
import type { BookingTemplateCatalog } from '@repo/shared';
import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import {
  requireBusinessSettings,
  selectedTemplateId,
} from '../utils/business-settings.util';

@Injectable()
export class ListBookingTemplatesUseCase {
  constructor(private readonly repository: BusinessSettingsRepository) {}

  async execute(
    tenantId: string,
    businessId: string,
  ): Promise<BookingTemplateCatalog> {
    const business = await requireBusinessSettings(
      this.repository,
      tenantId,
      businessId,
    );
    return {
      templates: BOOKING_TEMPLATES,
      selected_template_id: selectedTemplateId(business.settings),
    };
  }
}
