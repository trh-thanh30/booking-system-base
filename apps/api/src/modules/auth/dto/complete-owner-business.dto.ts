import type { BusinessOnboardingProfile } from '@repo/shared';
import { IsObject } from 'class-validator';
import { CompleteGoogleOwnerOnboardingDto } from './complete-google-owner-onboarding.dto';

export class CompleteOwnerBusinessDto extends CompleteGoogleOwnerOnboardingDto {
  @IsObject() business_profile: BusinessOnboardingProfile = undefined!;
}
