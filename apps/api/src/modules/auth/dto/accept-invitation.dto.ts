import { Match } from '@/common/decorators/match.decorator';
import type { AcceptInvitationInput } from '@repo/shared';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class AcceptInvitationDto implements AcceptInvitationInput {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  full_name?: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Confirm password does not match' })
  confirmPassword: string;
}
