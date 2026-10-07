import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class BusinessWorkingDayDto {
  @ApiProperty({
    minimum: 0,
    maximum: 6,
    description: '0 = Sunday, 6 = Saturday',
  })
  @IsInt()
  @Min(0)
  @Max(6)
  day_of_week: number;

  @ApiProperty()
  @IsBoolean()
  is_closed: boolean;

  @ApiProperty({ nullable: true, example: '09:00' })
  @ValidateIf((day: BusinessWorkingDayDto) => !day.is_closed)
  @IsString()
  opens_at: string | null;

  @ApiProperty({ nullable: true, example: '17:00' })
  @ValidateIf((day: BusinessWorkingDayDto) => !day.is_closed)
  @IsString()
  closes_at: string | null;
}

export class UpdateWorkingHoursDto {
  @ApiProperty({ type: [BusinessWorkingDayDto], minItems: 7, maxItems: 7 })
  @IsArray()
  @ArrayMinSize(7)
  @ArrayMaxSize(7)
  @ValidateNested({ each: true })
  @Type(() => BusinessWorkingDayDto)
  days: BusinessWorkingDayDto[];
}
