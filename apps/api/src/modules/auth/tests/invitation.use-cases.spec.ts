import { AcceptInvitationUseCase } from '@/modules/auth/use-cases/accept-invitation.usecase';
import { CreateInvitationUseCase } from '@/modules/auth/use-cases/create-invitation.usecase';
import { GetInvitationUseCase } from '@/modules/auth/use-cases/get-invitation.usecase';
import { user_role, user_status } from '@prisma/client';

const tenantId = 'tenant-1';
const invitedById = 'admin-1';

function invitation(overrides: Record<string, unknown> = {}) {
  return {
    id: 'invitation-1',
    tenant_id: tenantId,
    email: 'staff@example.com',
    role: user_role.STAFF,
    permission_keys: ['booking:read'],
    token_hash: 'token-hash',
    invited_by_id: invitedById,
    accepted_at: null,
    expires_at: new Date(Date.now() + 60_000),
    created_at: new Date('2026-07-05T00:00:00.000Z'),
    tenant: {
      id: tenantId,
      slug: 'demo-spa',
      name: 'Demo Spa',
    },
    ...overrides,
  };
}

describe('invitation use cases', () => {
  it('creates an invitation with a stored token hash and returned raw token', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
      userInvitation: {
        create: jest.fn().mockResolvedValue(invitation()),
      },
    };
    const permissions = {
      findPermissionsByKeys: jest
        .fn()
        .mockResolvedValue([{ id: 'permission-1' }]),
    };

    const result = await new CreateInvitationUseCase(
      prisma as any,
      permissions as any,
    ).execute(tenantId, invitedById, {
      email: 'staff@example.com',
      role: user_role.STAFF,
      permission_keys: ['booking:read', 'booking:read'],
    });

    expect(result).toMatchObject({
      id: 'invitation-1',
      email: 'staff@example.com',
      role: user_role.STAFF,
      permission_keys: ['booking:read'],
      tenant: {
        id: tenantId,
      },
    });
    expect(result.token).toHaveLength(64);
    expect(prisma.userInvitation.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          token_hash: expect.not.stringMatching(result.token),
          permission_keys: ['booking:read'],
        }),
      }),
    );
  });

  it('rejects invitation creation with invalid permission keys', async () => {
    await expect(
      new CreateInvitationUseCase(
        {
          user: { findUnique: jest.fn().mockResolvedValue(null) },
        } as any,
        { findPermissionsByKeys: jest.fn().mockResolvedValue([]) } as any,
      ).execute(tenantId, invitedById, {
        email: 'staff@example.com',
        permission_keys: ['booking:read'],
      }),
    ).rejects.toThrow('One or more permissions are invalid');
  });

  it('gets invitation metadata by token', async () => {
    await expect(
      new GetInvitationUseCase({
        userInvitation: {
          findUnique: jest.fn().mockResolvedValue(invitation()),
        },
      } as any).execute('raw-token'),
    ).resolves.toMatchObject({
      id: 'invitation-1',
      email: 'staff@example.com',
      is_expired: false,
    });
  });

  it('accepts an invitation, creates the user, assigns permissions, and marks accepted', async () => {
    const createdUser = {
      id: 'user-1',
      tenant_id: tenantId,
      email: 'staff@example.com',
      username: 'staff',
      full_name: 'Staff User',
      role: user_role.STAFF,
      status: user_status.ACTIVE,
      is_verified: true,
    };
    const prisma = {
      userInvitation: {
        findUnique: jest.fn().mockResolvedValue(invitation()),
        update: jest.fn().mockResolvedValue(undefined),
      },
      user: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(createdUser),
      },
    };
    const permissions = {
      findPermissionsByKeys: jest
        .fn()
        .mockResolvedValue([{ id: 'permission-1' }]),
      replaceUserPermissions: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      new AcceptInvitationUseCase(
        prisma as any,
        { hashPassword: jest.fn().mockResolvedValue('hashed-password') } as any,
        permissions as any,
      ).execute({
        token: 'raw-token',
        username: 'staff',
        full_name: 'Staff User',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    ).resolves.toEqual(createdUser);

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenant_id: tenantId,
        email: 'staff@example.com',
        username: 'staff',
        password: 'hashed-password',
        is_verified: true,
      }),
    });
    expect(permissions.replaceUserPermissions).toHaveBeenCalledWith(
      'user-1',
      tenantId,
      ['permission-1'],
      invitedById,
    );
    expect(prisma.userInvitation.update).toHaveBeenCalledWith({
      where: { id: 'invitation-1' },
      data: { accepted_at: expect.any(Date) },
    });
  });

  it('rejects accepted or expired invitations', async () => {
    const basePrisma = {
      user: { findUnique: jest.fn() },
    };

    await expect(
      new AcceptInvitationUseCase(
        {
          ...basePrisma,
          userInvitation: {
            findUnique: jest
              .fn()
              .mockResolvedValue(invitation({ accepted_at: new Date() })),
          },
        } as any,
        { hashPassword: jest.fn() } as any,
        { findPermissionsByKeys: jest.fn() } as any,
      ).execute({
        token: 'raw-token',
        username: 'staff',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    ).rejects.toThrow('Invitation has already been accepted');

    await expect(
      new AcceptInvitationUseCase(
        {
          ...basePrisma,
          userInvitation: {
            findUnique: jest.fn().mockResolvedValue(
              invitation({
                expires_at: new Date(Date.now() - 60_000),
              }),
            ),
          },
        } as any,
        { hashPassword: jest.fn() } as any,
        { findPermissionsByKeys: jest.fn() } as any,
      ).execute({
        token: 'raw-token',
        username: 'staff',
        password: 'password123',
        confirmPassword: 'password123',
      }),
    ).rejects.toThrow('Invitation has expired');
  });
});
