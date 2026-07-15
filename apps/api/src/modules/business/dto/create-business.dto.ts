import type { CreateBusinessInput } from '@repo/shared';
import { business_status } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateBusinessDto implements CreateBusinessInput {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsEnum(business_status)
  status?: business_status;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
