import type { SignupTenantInput } from '@repo/shared';
import {
  IsEmail,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class SignupTenantOwnerDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  username: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @MinLength(1)
  confirmPassword: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  full_name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}

export class SignupTenantDto implements SignupTenantInput {
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  slug: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  default_business_name?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  default_business_slug?: string;

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

  @ValidateNested()
  @Type(() => SignupTenantOwnerDto)
  owner: SignupTenantOwnerDto;
}
