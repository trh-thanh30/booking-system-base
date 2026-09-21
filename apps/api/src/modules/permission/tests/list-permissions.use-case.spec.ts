import { ListPermissionsUseCase } from '@/modules/permission/use-cases/list-permissions.use-case';

const permissions = [
  {
    id: 'permission-2',
    key: 'booking:create',
    resource: 'booking',
    action: 'create',
    description: 'Create bookings',
  },
  {
    id: 'permission-1',
    key: 'booking:read',
    resource: 'booking',
    action: 'read',
    description: 'Read bookings',
  },
  {
    id: 'permission-3',
    key: 'user:read',
    resource: 'user',
    action: 'read',
    description: null,
  },
];

describe('ListPermissionsUseCase', () => {
  it('returns permission summaries', async () => {
    const repository = {
      findAllPermissions: jest.fn().mockResolvedValue(permissions),
    };

    await expect(
      new ListPermissionsUseCase(repository as any).execute(),
    ).resolves.toEqual([
      {
        id: 'permission-2',
        key: 'booking:create',
        resource: 'booking',
        action: 'create',
        description: 'Create bookings',
      },
      {
        id: 'permission-1',
        key: 'booking:read',
        resource: 'booking',
        action: 'read',
        description: 'Read bookings',
      },
      {
        id: 'permission-3',
        key: 'user:read',
        resource: 'user',
        action: 'read',
        description: null,
      },
    ]);

    expect(repository.findAllPermissions).toHaveBeenCalledTimes(1);
  });

  it('groups permissions by resource', async () => {
    const repository = {
      findAllPermissions: jest.fn().mockResolvedValue(permissions),
    };

    await expect(
      new ListPermissionsUseCase(repository as any).groupedByResource(),
    ).resolves.toEqual([
      {
        resource: 'booking',
        permissions: [
          {
            id: 'permission-2',
            key: 'booking:create',
            resource: 'booking',
            action: 'create',
            description: 'Create bookings',
          },
          {
            id: 'permission-1',
            key: 'booking:read',
            resource: 'booking',
            action: 'read',
            description: 'Read bookings',
          },
        ],
      },
      {
        resource: 'user',
        permissions: [
          {
            id: 'permission-3',
            key: 'user:read',
            resource: 'user',
            action: 'read',
            description: null,
          },
        ],
      },
    ]);
  });
});
