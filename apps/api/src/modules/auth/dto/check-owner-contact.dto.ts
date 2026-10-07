import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import type { OwnerContactField } from '@repo/shared';

export class CheckOwnerContactDto {
  @IsIn(['username', 'phone'])
  field: OwnerContactField;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  value: string;
}
