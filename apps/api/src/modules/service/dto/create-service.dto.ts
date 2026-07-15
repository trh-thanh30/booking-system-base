import { service_status } from '@prisma/client';
import type { CreateServiceInput } from '@repo/shared';
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

export class CreateServiceDto implements CreateServiceInput {
  @IsOptional()
  @ValidateIf((dto: CreateServiceDto) => dto.category_id !== null)
  @IsUUID()
  category_id?: string | null;

  @IsString()
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  slug?: string;

  @IsOptional()
  @ValidateIf((dto: CreateServiceDto) => dto.description !== null)
  @IsString()
  @MaxLength(2000)
  description?: string | null;

  @IsInt()
  @Min(1)
  @Max(1440)
  duration_minutes: number;

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

  @IsInt()
  @Min(0)
  price_amount: number;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsEnum([service_status.ACTIVE, service_status.INACTIVE])
  status?: CreateServiceInput['status'];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  sort_order?: number;
}
