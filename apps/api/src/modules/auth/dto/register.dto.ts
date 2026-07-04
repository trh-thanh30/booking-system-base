import { Match } from '@/common/decorators/match.decorator';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import type { RegisterInput } from '@repo/shared';

export class RegisterDto implements RegisterInput {
  @IsNotEmpty()
  username: string;

  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Confirm password does not match' })
  confirmPassword: string;
}
