import type {
  PermissionResourceGroup,
  PermissionWithKey,
} from '@/common/types/permission.types';

export function toPermissionSummary(permission: PermissionWithKey) {
  return {
    id: permission.id,
    key: permission.key,
    resource: permission.resource,
    action: permission.action,
    description: permission.description,
  };
}

export function groupPermissionsByResource(
  permissions: PermissionWithKey[],
): PermissionResourceGroup[] {
  const grouped = new Map<string, PermissionWithKey[]>();

  for (const permission of permissions) {
    const values = grouped.get(permission.resource) ?? [];
    values.push(permission);
    grouped.set(permission.resource, values);
  }

  return Array.from(grouped.entries()).map(([resource, values]) => ({
    resource,
    permissions: values.map(toPermissionSummary),
  }));
}
