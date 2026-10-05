import { Match } from '@/common/decorators/match.decorator';
import { IsNotEmpty, Matches, MinLength } from 'class-validator';
import type { ResetPasswordInput } from '@repo/shared';

export class ResetPasswordDto implements ResetPasswordInput {
  @IsNotEmpty()
  sessionId: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{6}$/, { message: 'Code must contain exactly 6 digits' })
  code: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Confirm password does not match' })
  confirmPassword: string;
}
