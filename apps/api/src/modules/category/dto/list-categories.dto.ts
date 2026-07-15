import { category_status, category_type } from '@prisma/client';
import type { ListCategoriesInput } from '@repo/shared';
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

export class ListCategoriesDto implements ListCategoriesInput {
  @IsOptional()
  @IsEnum(category_type)
  type?: category_type;

  @IsOptional()
  @IsEnum(category_status)
  status?: category_status;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @Transform(({ value }) => (value === 'null' ? null : value))
  @ValidateIf((dto: ListCategoriesDto) => dto.parent_id !== null)
  @IsUUID()
  parent_id?: string | null;

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
