import { RefreshTokenSessionService } from '@/modules/auth/services/refresh-token-session.service';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';

const sessions = new RefreshTokenSessionService();
import { user_role, user_status } from '@prisma/client';

function user(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-1',
    email: 'user@example.com',
    username: 'user',
    role: user_role.CUSTOMER,
    status: user_status.ACTIVE,
    refresh_token_hash: sessions.hash('refresh-token'),
    is_verified: true,
    tenant_id: null,
    ...overrides,
  };
}

describe('RefreshTokenUseCase', () => {
  it('rejects missing token, unknown user, token mismatch, and role mismatch', async () => {
    const tokenService = {
      verifyRefreshToken: jest
        .fn()
        .mockReturnValue({ payload: { id: 'user-1', tenant_id: null } }),
      generateAccessToken: jest.fn(),
    } as any;

    await expect(
      new RefreshTokenUseCase(
        { user: { findUnique: jest.fn() } } as any,
        tokenService,
      ).execute(''),
    ).rejects.toThrow('Invalid or expired refresh token');

    await expect(
      new RefreshTokenUseCase(
        { user: { findUnique: jest.fn().mockResolvedValue(null) } } as any,
        tokenService,
      ).execute('refresh-token'),
    ).rejects.toThrow('Invalid or expired refresh token');

    await expect(
      new RefreshTokenUseCase(
        {
          user: {
            findUnique: jest
              .fn()
              .mockResolvedValue(
                user({ refresh_token_hash: sessions.hash('different-token') }),
              ),
          },
        } as any,
        tokenService,
      ).execute('refresh-token'),
    ).rejects.toThrow('Invalid or expired refresh token');

    await expect(
      new RefreshTokenUseCase(
        { user: { findUnique: jest.fn().mockResolvedValue(user()) } } as any,
        tokenService,
      ).execute('refresh-token', user_role.OWNER),
    ).rejects.toThrow('Invalid or expired refresh token');
  });

  it('rejects a refresh token after the account moves to another tenant', async () => {
    const tokenService = {
      verifyRefreshToken: jest.fn().mockReturnValue({
        payload: { id: 'user-1', tenant_id: 'tenant-old' },
      }),
      generateAccessToken: jest.fn(),
    };
    const useCase = new RefreshTokenUseCase(
      {
        user: {
          findUnique: jest.fn().mockResolvedValue(
            user({
              role: user_role.OWNER,
              tenant_id: 'tenant-new',
            }),
          ),
          update: jest.fn().mockResolvedValue(undefined),
        },
      } as any,
      tokenService as any,
    );

    await expect(
      useCase.execute(
        'refresh-token',
        [user_role.OWNER, user_role.STAFF],
        'admin',
      ),
    ).rejects.toThrow('Invalid or expired refresh token');

    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
  });

  it('returns a new access token while preserving refresh token', async () => {
    const tokenService = {
      verifyRefreshToken: jest
        .fn()
        .mockReturnValue({ payload: { id: 'user-1', tenant_id: null } }),
      generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
    } as any;
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user()),
      },
    } as any;
    const useCase = new RefreshTokenUseCase(prisma, tokenService);

    await expect(useCase.execute('refresh-token')).resolves.toEqual({
      access_token: 'new-access-token',
    });

    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({
        id: 'user-1',
        email: 'user@example.com',
        role: user_role.CUSTOMER,
      }),
      'client',
    );
  });

  it('wraps invalid token verifier errors as unauthorized', async () => {
    const useCase = new RefreshTokenUseCase(
      { user: { findUnique: jest.fn() } } as any,
      {
        verifyRefreshToken: jest.fn(() => {
          throw new Error('bad jwt');
        }),
      } as any,
    );

    await expect(useCase.execute('refresh-token')).rejects.toThrow(
      'Invalid or expired refresh token',
    );
  });

  it('revokes the stored refresh token when the token matches', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user()),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const useCase = new RefreshTokenUseCase(
      prisma as any,
      {
        verifyRefreshToken: jest
          .fn()
          .mockReturnValue({ payload: { id: 'user-1', tenant_id: null } }),
      } as any,
    );

    await useCase.revoke('refresh-token', [user_role.CUSTOMER]);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { refresh_token_hash: null },
    });
  });

  it('does not revoke when token role context does not match', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue(user()),
        update: jest.fn(),
      },
    };
    const useCase = new RefreshTokenUseCase(
      prisma as any,
      {
        verifyRefreshToken: jest
          .fn()
          .mockReturnValue({ payload: { id: 'user-1', tenant_id: null } }),
      } as any,
    );

    await useCase.revoke('refresh-token', [user_role.OWNER]);

    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it('rejects an Owner or Staff refresh after the account loses its tenant', async () => {
    const tokenService = {
      verifyRefreshToken: jest
        .fn()
        .mockReturnValue({ payload: { id: 'user-1', tenant_id: null } }),
      generateAccessToken: jest.fn(),
    };
    const useCase = new RefreshTokenUseCase(
      {
        user: {
          findUnique: jest
            .fn()
            .mockResolvedValue(
              user({ role: user_role.OWNER, tenant_id: null }),
            ),
        },
      } as any,
      tokenService as any,
    );

    await expect(
      useCase.execute('refresh-token', [user_role.OWNER, user_role.STAFF]),
    ).rejects.toThrow('Invalid or expired refresh token');

    expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
  });
});
