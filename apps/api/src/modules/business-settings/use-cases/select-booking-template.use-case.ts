import { Injectable } from '@nestjs/common';
import { selectBookingTemplateSchema } from '@repo/shared';
import type { BookingTemplateSelection } from '@repo/shared';
import { BusinessSettingsRepository } from '../repository/business-settings.repository';
import { parseSettingsInput } from '../utils/business-settings.util';

@Injectable()
export class SelectBookingTemplateUseCase {
  constructor(private readonly repository: BusinessSettingsRepository) {}

  async execute(
    tenantId: string,
    businessId: string,
    input: unknown,
  ): Promise<BookingTemplateSelection> {
    const { template_id } = parseSettingsInput(
      selectBookingTemplateSchema,
      input,
    );
    await this.repository.patchSettings(tenantId, businessId, {
      booking_template_id: template_id,
    });
    return { selected_template_id: template_id };
  }
}
