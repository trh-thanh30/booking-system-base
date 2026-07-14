import type { CreateTenantInput } from '@repo/shared';
import { tenant_status } from '@prisma/client';
import {
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateTenantDto implements CreateTenantInput {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsEnum(tenant_status)
  status?: tenant_status;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsString()
  locale?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  primary_domain?: string;

  @IsOptional()
  @IsObject()
  settings?: Record<string, unknown>;
}
