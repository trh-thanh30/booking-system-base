import type { PERMISSIONS } from "../constants/index.ts";

type PermissionGroups = typeof PERMISSIONS;
type PermissionGroup = PermissionGroups[keyof PermissionGroups];

export type PermissionKey = PermissionGroup[keyof PermissionGroup];

export type PermissionSummary = {
  id: string;
  key: PermissionKey | string;
  resource: string;
  action: string;
  description?: string | null;
};

export type AssignUserPermissionsInput = {
  permission_keys: string[];
};

export type CurrentUserPermissions = {
  user_id: string;
  tenant_id: string;
  permissions: string[];
};
