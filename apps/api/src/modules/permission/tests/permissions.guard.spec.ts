import { PermissionsGuard } from '@/common/guards/permissions.guard';
import { user_role } from '@prisma/client';

function context(request: Record<string, unknown>) {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
  };
}

function guard(
  requiredPermissions: string[] | undefined,
  userPermissions: string[] = [],
) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requiredPermissions),
  };
  const getUserPermissionsUseCase = {
    execute: jest.fn().mockResolvedValue(userPermissions),
  };

  return {
    reflector,
    getUserPermissionsUseCase,
    permissionsGuard: new PermissionsGuard(
      reflector as any,
      getUserPermissionsUseCase as any,
    ),
  };
}

describe('PermissionsGuard', () => {
  it('allows requests without required permission metadata', async () => {
    const { permissionsGuard, getUserPermissionsUseCase } = guard(undefined);

    await expect(
      permissionsGuard.canActivate(context({}) as any),
    ).resolves.toBe(true);

    expect(getUserPermissionsUseCase.execute).not.toHaveBeenCalled();
  });

  it('bypasses permission checks for SUPER_ADMIN users', async () => {
    const { permissionsGuard, getUserPermissionsUseCase } = guard([
      'permission:manage',
    ]);

    await expect(
      permissionsGuard.canActivate(
        context({
          user: { id: 'super-admin-1', role: user_role.SUPER_ADMIN },
        }) as any,
      ),
    ).resolves.toBe(true);

    expect(getUserPermissionsUseCase.execute).not.toHaveBeenCalled();
  });

  it('requires tenant context for tenant permission checks', async () => {
    const { permissionsGuard } = guard(['booking:read']);

    await expect(
      permissionsGuard.canActivate(
        context({
          user: { id: 'staff-1', role: user_role.STAFF },
        }) as any,
      ),
    ).rejects.toThrow('Tenant context is required for permissions');
  });

  it('bypasses tenant permission checks for OWNER users with tenant context', async () => {
    const { permissionsGuard, getUserPermissionsUseCase } = guard([
      'permission:manage',
    ]);

    await expect(
      permissionsGuard.canActivate(
        context({
          user: { id: 'owner-1', role: user_role.OWNER },
          tenant: { id: 'tenant-1' },
        }) as any,
      ),
    ).resolves.toBe(true);

    expect(getUserPermissionsUseCase.execute).not.toHaveBeenCalled();
  });

  it('allows exact permission matches', async () => {
    const { permissionsGuard, getUserPermissionsUseCase } = guard(
      ['booking:read'],
      ['booking:read'],
    );

    await expect(
      permissionsGuard.canActivate(
        context({
          user: { id: 'staff-1', role: user_role.STAFF },
          tenant: { id: 'tenant-1' },
        }) as any,
      ),
    ).resolves.toBe(true);

    expect(getUserPermissionsUseCase.execute).toHaveBeenCalledWith(
      'staff-1',
      'tenant-1',
    );
  });

  it('allows resource manage permission to cover resource actions', async () => {
    const { permissionsGuard } = guard(['booking:update'], ['booking:manage']);

    await expect(
      permissionsGuard.canActivate(
        context({
          user: { id: 'manager-1', role: user_role.STAFF },
          tenant: { id: 'tenant-1' },
        }) as any,
      ),
    ).resolves.toBe(true);
  });

  it('rejects users without all required permissions', async () => {
    const { permissionsGuard } = guard(
      ['booking:read', 'user:read'],
      ['booking:read'],
    );

    await expect(
      permissionsGuard.canActivate(
        context({
          user: { id: 'staff-1', role: user_role.STAFF },
          tenant: { id: 'tenant-1' },
        }) as any,
      ),
    ).rejects.toThrow('Access denied');
  });
});
