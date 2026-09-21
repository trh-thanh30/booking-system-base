import { AssignUserPermissionsUseCase } from '@/modules/permission/use-cases/assign-user-permissions.use-case';
import { GetUserPermissionsUseCase } from '@/modules/permission/use-cases/get-user-permissions.use-case';
import { ListUserPermissionsUseCase } from '@/modules/permission/use-cases/list-user-permissions.use-case';
import { ReplaceUserPermissionsUseCase } from '@/modules/permission/use-cases/replace-user-permissions.use-case';
import { RevokeUserPermissionsUseCase } from '@/modules/permission/use-cases/revoke-user-permissions.use-case';

const userId = 'user-1';
const tenantId = 'tenant-1';
const grantedById = 'admin-1';

function permission(overrides: Record<string, unknown> = {}) {
  return {
    id: 'permission-1',
    key: 'booking:read',
    resource: 'booking',
    action: 'read',
    description: 'Read bookings',
    ...overrides,
  };
}

function userPermission(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-permission-1',
    user_id: userId,
    permission_id: 'permission-1',
    tenant_id: tenantId,
    granted_by_id: grantedById,
    created_at: new Date('2026-07-05T00:00:00.000Z'),
    permission: permission(),
    ...overrides,
  };
}

function repository(overrides: Record<string, unknown> = {}) {
  return {
    findUserByIdInTenant: jest.fn().mockResolvedValue({ id: userId }),
    findPermissionsByKeys: jest.fn().mockResolvedValue([permission()]),
    findUserPermissionKeys: jest.fn().mockResolvedValue([userPermission()]),
    findUserPermissions: jest.fn().mockResolvedValue([userPermission()]),
    assignUserPermissions: jest.fn().mockResolvedValue([userPermission()]),
    replaceUserPermissions: jest.fn().mockResolvedValue([userPermission()]),
    revokeUserPermissions: jest.fn().mockResolvedValue([]),
    ...overrides,
  };
}

describe('user permission use cases', () => {
  it('returns permission keys for guard checks', async () => {
    const repo = repository({
      findUserPermissionKeys: jest
        .fn()
        .mockResolvedValue([
          userPermission({ permission: permission({ key: 'booking:read' }) }),
          userPermission({ permission: permission({ key: 'booking:create' }) }),
        ]),
    });

    await expect(
      new GetUserPermissionsUseCase(repo as any).execute(userId, tenantId),
    ).resolves.toEqual(['booking:read', 'booking:create']);
  });

  it('lists user permissions and rejects users outside the tenant', async () => {
    await expect(
      new ListUserPermissionsUseCase(repository() as any).execute(
        userId,
        tenantId,
      ),
    ).resolves.toEqual({
      user_id: userId,
      tenant_id: tenantId,
      permissions: [
        {
          id: 'permission-1',
          key: 'booking:read',
          resource: 'booking',
          action: 'read',
          description: 'Read bookings',
        },
      ],
    });

    await expect(
      new ListUserPermissionsUseCase(
        repository({
          findUserByIdInTenant: jest.fn().mockResolvedValue(null),
        }) as any,
      ).execute(userId, tenantId),
    ).rejects.toThrow('User not found');
  });

  it('assigns valid permissions to a user', async () => {
    const repo = repository();

    await expect(
      new AssignUserPermissionsUseCase(repo as any).execute(
        userId,
        tenantId,
        { permission_keys: ['booking:read'] },
        grantedById,
      ),
    ).resolves.toEqual({
      user_id: userId,
      tenant_id: tenantId,
      permissions: [
        {
          id: 'permission-1',
          key: 'booking:read',
          resource: 'booking',
          action: 'read',
          description: 'Read bookings',
        },
      ],
    });

    expect(repo.assignUserPermissions).toHaveBeenCalledWith(
      userId,
      tenantId,
      ['permission-1'],
      grantedById,
    );
  });

  it('rejects invalid permission keys on assign', async () => {
    const repo = repository({
      findPermissionsByKeys: jest.fn().mockResolvedValue([]),
    });

    await expect(
      new AssignUserPermissionsUseCase(repo as any).execute(userId, tenantId, {
        permission_keys: ['booking:read'],
      }),
    ).rejects.toThrow('One or more permissions are invalid');

    expect(repo.assignUserPermissions).not.toHaveBeenCalled();
  });

  it('deduplicates keys and replaces all user permissions', async () => {
    const repo = repository();

    await new ReplaceUserPermissionsUseCase(repo as any).execute(
      userId,
      tenantId,
      { permission_keys: ['booking:read', 'booking:read'] },
      grantedById,
    );

    expect(repo.findPermissionsByKeys).toHaveBeenCalledWith(['booking:read']);
    expect(repo.replaceUserPermissions).toHaveBeenCalledWith(
      userId,
      tenantId,
      ['permission-1'],
      grantedById,
    );
  });

  it('allows replacing with an empty permission set', async () => {
    const repo = repository({
      findPermissionsByKeys: jest.fn().mockResolvedValue([]),
      replaceUserPermissions: jest.fn().mockResolvedValue([]),
    });

    await expect(
      new ReplaceUserPermissionsUseCase(repo as any).execute(userId, tenantId, {
        permission_keys: [],
      }),
    ).resolves.toEqual({
      user_id: userId,
      tenant_id: tenantId,
      permissions: [],
    });
  });

  it('revokes valid permissions from a user', async () => {
    const repo = repository();

    await expect(
      new RevokeUserPermissionsUseCase(repo as any).execute(userId, tenantId, {
        permission_keys: ['booking:read'],
      }),
    ).resolves.toEqual({
      user_id: userId,
      tenant_id: tenantId,
      permissions: [],
    });

    expect(repo.revokeUserPermissions).toHaveBeenCalledWith(userId, tenantId, [
      'permission-1',
    ]);
  });
});
