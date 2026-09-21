import { CreateUserUseCase } from '@/modules/user/use-cases/create-user.use-case';
import { DeleteUserUseCase } from '@/modules/user/use-cases/delete-user.use-case';
import { GetUserUseCase } from '@/modules/user/use-cases/get-user.use-case';
import { ListUsersUseCase } from '@/modules/user/use-cases/list-users.use-case';
import { UpdateUserUseCase } from '@/modules/user/use-cases/update-user.use-case';
import { user_role, user_status } from '@prisma/client';

const tenantId = 'tenant-1';
const userId = 'user-1';

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: userId,
    tenant_id: tenantId,
    email: 'staff@example.com',
    username: 'staff',
    password: 'hashed-password',
    role: user_role.STAFF,
    status: user_status.ACTIVE,
    is_verified: true,
    created_at: new Date('2026-07-05T00:00:00.000Z'),
    updated_at: new Date('2026-07-05T00:00:00.000Z'),
    ...overrides,
  };
}

describe('user use cases', () => {
  it('creates a tenant-scoped user with a hashed password', async () => {
    const repository = {
      createUnchecked: jest.fn().mockResolvedValue(user()),
    };
    const bcrypt = {
      hashPassword: jest.fn().mockResolvedValue('hashed-password'),
    };

    await expect(
      new CreateUserUseCase(repository as any, bcrypt as any).execute(
        tenantId,
        {
          username: 'staff',
          email: 'staff@example.com',
          password: 'password123',
          role: user_role.STAFF,
        },
      ),
    ).resolves.toEqual(user());

    expect(bcrypt.hashPassword).toHaveBeenCalledWith('password123');
    expect(repository.createUnchecked).toHaveBeenCalledWith({
      username: 'staff',
      email: 'staff@example.com',
      password: 'hashed-password',
      role: user_role.STAFF,
      tenant_id: tenantId,
    });
  });

  it('lists users for a tenant', async () => {
    const repository = {
      findAllByTenant: jest.fn().mockResolvedValue([user()]),
    };

    await expect(
      new ListUsersUseCase(repository as any).execute(tenantId),
    ).resolves.toEqual([user()]);

    expect(repository.findAllByTenant).toHaveBeenCalledWith(tenantId);
  });

  it('gets a user in the current tenant and rejects missing users', async () => {
    await expect(
      new GetUserUseCase({
        findByIdInTenant: jest.fn().mockResolvedValue(user()),
      } as any).execute(tenantId, userId),
    ).resolves.toEqual(user());

    await expect(
      new GetUserUseCase({
        findByIdInTenant: jest.fn().mockResolvedValue(null),
      } as any).execute(tenantId, userId),
    ).rejects.toThrow('User not found');
  });

  it('updates a tenant-scoped user', async () => {
    const repository = {
      findByIdInTenant: jest.fn().mockResolvedValue(user()),
      update: jest.fn().mockResolvedValue(user({ full_name: 'Staff User' })),
    };

    await expect(
      new UpdateUserUseCase(
        repository as any,
        {
          hashPassword: jest.fn(),
        } as any,
      ).execute(tenantId, userId, {
        full_name: 'Staff User',
      }),
    ).resolves.toEqual(user({ full_name: 'Staff User' }));

    expect(repository.update).toHaveBeenCalledWith(userId, {
      full_name: 'Staff User',
    });
  });

  it('hashes password updates and clears refresh token', async () => {
    const repository = {
      findByIdInTenant: jest.fn().mockResolvedValue(user()),
      update: jest.fn().mockResolvedValue(user()),
    };
    const bcrypt = {
      hashPassword: jest.fn().mockResolvedValue('hashed-new-password'),
    };

    await new UpdateUserUseCase(repository as any, bcrypt as any).execute(
      tenantId,
      userId,
      {
        password: 'new-password',
      },
    );

    expect(repository.update).toHaveBeenCalledWith(userId, {
      password: 'hashed-new-password',
      refresh_token: null,
    });
  });

  it('rejects updates for users outside the tenant', async () => {
    const repository = {
      findByIdInTenant: jest.fn().mockResolvedValue(null),
      update: jest.fn(),
    };

    await expect(
      new UpdateUserUseCase(
        repository as any,
        {
          hashPassword: jest.fn(),
        } as any,
      ).execute(tenantId, userId, {
        full_name: 'Staff User',
      }),
    ).rejects.toThrow('User not found');

    expect(repository.update).not.toHaveBeenCalled();
  });

  it('deletes a tenant-scoped user', async () => {
    const repository = {
      findByIdInTenant: jest.fn().mockResolvedValue(user()),
      delete: jest.fn().mockResolvedValue(user()),
    };

    await expect(
      new DeleteUserUseCase(repository as any).execute(tenantId, userId),
    ).resolves.toEqual(user());

    expect(repository.delete).toHaveBeenCalledWith(userId);
  });

  it('rejects deletes for users outside the tenant', async () => {
    const repository = {
      findByIdInTenant: jest.fn().mockResolvedValue(null),
      delete: jest.fn(),
    };

    await expect(
      new DeleteUserUseCase(repository as any).execute(tenantId, userId),
    ).rejects.toThrow('User not found');

    expect(repository.delete).not.toHaveBeenCalled();
  });
});
