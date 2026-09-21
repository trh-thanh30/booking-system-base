import { Match } from '@/common/decorators';
import { IsNotEmpty, MinLength } from 'class-validator';
import type { ChangePasswordInput } from '@repo/shared';

export class ChangePasswordDto implements ChangePasswordInput {
  @IsNotEmpty()
  currentPassword: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsNotEmpty()
  @Match('password', { message: 'Confirm password does not match' })
  confirmPassword: string;
}
