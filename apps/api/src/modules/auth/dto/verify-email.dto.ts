import { IsNotEmpty, MinLength } from 'class-validator';
import type { VerifyEmailInput } from '@repo/shared';

export class VerifyEmailDto implements VerifyEmailInput {
  @IsNotEmpty()
  sessionId: string;

  @IsNotEmpty()
  @MinLength(6)
  code: string;
}
