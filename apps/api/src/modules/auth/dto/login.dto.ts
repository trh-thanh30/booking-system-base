// file: src/auth/dto/login.dto.ts

import { IsNotEmpty, IsString } from 'class-validator';
import type { LoginInput } from '@repo/shared';

export class LoginDto implements LoginInput {
  @IsNotEmpty()
  @IsString()
  usernameOrEmail: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
