import { IsIn, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BOOKING_TEMPLATE_IDS } from '@repo/shared';
import type { SelectBookingTemplateInput } from '@repo/shared';

export class SelectBookingTemplateDto implements SelectBookingTemplateInput {
  @ApiProperty({ enum: [...BOOKING_TEMPLATE_IDS] })
  @IsString()
  @IsIn(BOOKING_TEMPLATE_IDS)
  template_id: SelectBookingTemplateInput['template_id'];
}
