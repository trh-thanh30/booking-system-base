import type { AssignUserPermissionsInput } from '@repo/shared';
import { IsArray, IsString } from 'class-validator';

export class UserPermissionsDto implements AssignUserPermissionsInput {
  @IsArray()
  @IsString({ each: true })
  permission_keys: string[];
}
