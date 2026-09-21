import { IsOptional, IsEnum, IsString, IsBoolean } from 'class-validator';
import { user_role, user_status } from '@prisma/client';
import type { UpdateUserInput } from '@repo/shared';

export class UpdateUserDto implements UpdateUserInput {
  @IsOptional()
  @IsString()
  username?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  full_name?: string | null;

  @IsOptional()
  @IsString()
  phone?: string | null;

  @IsOptional()
  @IsString()
  avatar_url?: string | null;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsEnum(user_role)
  role?: user_role;

  @IsOptional()
  @IsEnum(user_status)
  status?: user_status;

  @IsOptional()
  @IsBoolean()
  is_verified?: boolean;
}
