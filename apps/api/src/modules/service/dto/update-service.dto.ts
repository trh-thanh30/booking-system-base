import { service_status } from '@prisma/client';
import type { UpdateServiceInput } from '@repo/shared';
import {
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

export class UpdateServiceDto implements UpdateServiceInput {
  @IsOptional()
  @ValidateIf((dto: UpdateServiceDto) => dto.category_id !== null)
  @IsUUID()
  category_id?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @ValidateIf((dto: UpdateServiceDto) => dto.description !== null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1440)
  duration_minutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  buffer_before_minutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(240)
  buffer_after_minutes?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  price_amount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsEnum([service_status.ACTIVE, service_status.INACTIVE])
  status?: UpdateServiceInput['status'];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  sort_order?: number;
}
