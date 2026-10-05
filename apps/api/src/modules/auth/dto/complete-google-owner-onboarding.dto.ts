import type { CompleteGoogleOwnerOnboardingInput } from '@repo/shared';
import type { BusinessOnboardingProfile } from '@repo/shared';
import { Type } from 'class-transformer';
import {
  IsUUID,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class GoogleOwnerIdentityDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  phone?: string;
}

export class CompleteGoogleOwnerOnboardingDto implements CompleteGoogleOwnerOnboardingInput {
  @IsUUID()
  business_category_id: string;

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

  @IsOptional()
  @IsObject()
  business_profile?: BusinessOnboardingProfile;

  @ValidateNested()
  @Type(() => GoogleOwnerIdentityDto)
  owner: GoogleOwnerIdentityDto;
}
