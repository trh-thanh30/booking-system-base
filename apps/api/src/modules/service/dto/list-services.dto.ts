import { service_status } from '@prisma/client';
import type { ListServicesInput } from '@repo/shared';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class ListServicesDto implements ListServicesInput {
  @IsOptional()
  @IsString()
  @MaxLength(160)
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (value === 'null' ? null : value))
  @ValidateIf((dto: ListServicesDto) => dto.category_id !== null)
  @IsUUID()
  category_id?: string | null;

  @IsOptional()
  @IsEnum(service_status)
  status?: service_status;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  include_archived?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;
}
