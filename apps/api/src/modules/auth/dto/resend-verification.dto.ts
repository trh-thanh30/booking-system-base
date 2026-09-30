import type { ResendVerificationInput } from '@repo/shared';
import { IsNotEmpty } from 'class-validator';

export class ResendVerificationDto implements ResendVerificationInput {
  @IsNotEmpty()
  sessionId: string;
}
