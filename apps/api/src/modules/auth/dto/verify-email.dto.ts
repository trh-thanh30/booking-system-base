import { IsNotEmpty, Matches } from 'class-validator';
import type { VerifyEmailInput } from '@repo/shared';

export class VerifyEmailDto implements VerifyEmailInput {
  @IsNotEmpty()
  sessionId: string;

  @IsNotEmpty()
  @Matches(/^[0-9]{6}$/, { message: 'Code must contain exactly 6 digits' })
  code: string;
}
