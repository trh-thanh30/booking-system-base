import { Match } from '@/common/decorators/match.decorator';
import { IsNotEmpty, MinLength } from 'class-validator';
import type { ResetPasswordInput } from '@repo/shared';

export class ResetPasswordDto implements ResetPasswordInput {
  @IsNotEmpty()
  sessionId: string;

  @IsNotEmpty()
  code: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Confirm password does not match' })
  confirmPassword: string;
}
