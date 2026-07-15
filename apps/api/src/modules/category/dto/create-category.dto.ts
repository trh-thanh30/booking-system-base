import { category_status, category_type } from '@prisma/client';
import type { CreateCategoryInput } from '@repo/shared';
import {
  IsEnum,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateCategoryDto implements CreateCategoryInput {
  @IsEnum(category_type)
  type: category_type;

  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(140)
  slug?: string;

  @IsOptional()
  @ValidateIf((dto: CreateCategoryDto) => dto.description !== null)
  @IsString()
  @MaxLength(1000)
  description?: string | null;

  @IsOptional()
  @IsEnum([category_status.ACTIVE, category_status.INACTIVE])
  status?: CreateCategoryInput['status'];

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  sort_order?: number;

  @IsOptional()
  @ValidateIf((dto: CreateCategoryDto) => dto.parent_id !== null)
  @IsUUID()
  parent_id?: string | null;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
