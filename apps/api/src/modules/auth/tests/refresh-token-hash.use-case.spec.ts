import { RefreshTokenSessionService } from '@/modules/auth/services/refresh-token-session.service';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';
import { user_role, user_status } from '@prisma/client';

describe('RefreshTokenUseCase hash lifecycle', () => {
  it('matches the stored hash and issues only a new access token', async () => {
    const rawRefreshToken = 'admin-refresh-token';
    const sessions = new RefreshTokenSessionService();
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'owner-1',
          email: 'owner@example.com',
          username: 'owner',
          role: user_role.OWNER,
          status: user_status.ACTIVE,
          is_verified: true,
          tenant_id: 'tenant-1',
          refresh_token_hash: sessions.hash(rawRefreshToken),
        }),
      },
    };
    const tokenService = {
      generateAccessToken: jest.fn().mockReturnValue('new-access-token'),
      verifyRefreshToken: jest
        .fn()
        .mockReturnValue({ payload: { id: 'owner-1', tenant_id: 'tenant-1' } }),
    };
    const useCase = new RefreshTokenUseCase(
      prisma as never,
      tokenService as never,
      sessions,
    );

    await expect(
      useCase.execute(
        rawRefreshToken,
        [user_role.OWNER, user_role.STAFF],
        'admin',
      ),
    ).resolves.toEqual({ access_token: 'new-access-token' });

    expect(tokenService.verifyRefreshToken).toHaveBeenCalledWith(
      rawRefreshToken,
      'admin',
    );
    expect(tokenService.generateAccessToken).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'owner-1', role: user_role.OWNER }),
      'admin',
    );
  });

  it('revokes a stored session when the user is inactive', async () => {
    const rawRefreshToken = 'inactive-refresh-token';
    const sessions = new RefreshTokenSessionService();
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'staff-1',
          email: 'staff.com',
          username: 'staff',
          role: user_role.STAFF,
          status: user_status.INACTIVE,
          is_verified: true,
          tenant_id: 'tenant-1',
          refresh_token_hash: sessions.hash(rawRefreshToken),
        }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const useCase = new RefreshTokenUseCase(
      prisma as never,
      {
        generateAccessToken: jest.fn(),
        verifyRefreshToken: jest.fn().mockReturnValue({
          payload: { id: 'staff-1', tenant_id: 'tenant-1' },
        }),
      } as never,
      sessions,
    );

    await expect(
      useCase.execute(
        rawRefreshToken,
        [user_role.OWNER, user_role.STAFF],
        'admin',
      ),
    ).rejects.toThrow('Invalid or expired refresh token');

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 'staff-1' },
      data: { refresh_token_hash: null },
    });
  });
});
