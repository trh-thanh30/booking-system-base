import { Match } from '@/common/decorators/match.decorator';
import type { RegisterOwnerInput } from '@repo/shared';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class RegisterOwnerIdentityDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  username: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Confirm password does not match' })
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

export class RegisterOwnerDto implements RegisterOwnerInput {
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
  @Type(() => RegisterOwnerIdentityDto)
  owner: RegisterOwnerIdentityDto;
}
