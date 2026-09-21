import { IsEmail, IsNotEmpty } from 'class-validator';
import type { RequestVerificationInput } from '@repo/shared';

export class RequestVerificationDto implements RequestVerificationInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
