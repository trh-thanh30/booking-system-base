import { IsEmail, IsNotEmpty } from 'class-validator';
import type { EmailRequestInput } from '@repo/shared';

export class EmailRequestDto implements EmailRequestInput {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
