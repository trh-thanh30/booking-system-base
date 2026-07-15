import type { Permission } from '@prisma/client';

export type PermissionWithKey = Pick<
  Permission,
  'id' | 'key' | 'resource' | 'action' | 'description'
>;

export type PermissionResourceGroup = {
  resource: string;
  permissions: PermissionWithKey[];
};
