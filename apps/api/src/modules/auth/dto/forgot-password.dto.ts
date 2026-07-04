import { IsEmail, IsNotEmpty } from 'class-validator';
import type { ForgotPasswordInput } from '@repo/shared';

export class ForgotPasswordDto implements ForgotPasswordInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
