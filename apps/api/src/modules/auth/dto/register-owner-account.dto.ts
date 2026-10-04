import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterOwnerAccountDto {
  @IsEmail() @MaxLength(160) email: string;
  @IsString() @MinLength(8) @MaxLength(128) password: string;
  @IsString() @MaxLength(128) confirmPassword: string;
}
