import type { CreateInvitationInput } from '@repo/shared';
import { user_role } from '@prisma/client';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateInvitationDto implements CreateInvitationInput {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsEnum(user_role)
  role?: user_role;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  permission_keys?: string[];
}
