import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { user_role, user_status } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';

import { UnauthorizedError } from '@/common/response';
import { PlatformAuthController } from '@/modules/auth/platform-auth.controller';
import { AuthCookieService } from '@/modules/auth/service/auth-cookie.service';
import { AuthProfileService } from '@/modules/auth/service/auth-profile.service';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';

describe('PlatformAuthController', () => {
  let app: INestApplication<App>;
  let httpServer: App;

  const loginUserUseCase = {
    execute: jest.fn(),
  };
  const refreshTokenUseCase = {
    execute: jest.fn(),
    revoke: jest.fn(),
  };
  const authCookieService = {
    clearRefreshCookies: jest.fn(),
    getRefreshToken: jest.fn(),
    setRefreshCookies: jest.fn(),
  };
  const authProfileService = {
    getByUserId: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleRef = await Test.createTestingModule({
      controllers: [PlatformAuthController],
      providers: [
        { provide: LoginUserUseCase, useValue: loginUserUseCase },
        { provide: RefreshTokenUseCase, useValue: refreshTokenUseCase },
        { provide: AuthCookieService, useValue: authCookieService },
        { provide: AuthProfileService, useValue: authProfileService },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useLogger(false);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it('logs a Super Admin in through the platform-specific route', async () => {
    const user = {
      id: 'platform-user-id',
      email: 'platform@example.com',
      username: 'platform-admin',
      password: 'hashed-password',
      full_name: 'Platform Admin',
      phone: null,
      avatar_url: null,
      tenant_id: null,
      role: user_role.SUPER_ADMIN,
      status: user_status.ACTIVE,
      is_verified: true,
      refresh_token: null,
      created_at: new Date('2026-01-01T00:00:00.000Z'),
      updated_at: new Date('2026-01-01T00:00:00.000Z'),
    };
    const authUser = {
      id: user.id,
      tenant_id: user.tenant_id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
      tenant: null,
      businesses: [],
      permissions: ['*'],
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };

    loginUserUseCase.execute.mockResolvedValue({
      access_token: 'platform-access-token',
      refresh_token: 'platform-refresh-token',
      user,
    });
    authProfileService.getByUserId.mockResolvedValue(authUser);

    await request(httpServer)
      .post('/auth/platform/login')
      .send({
        usernameOrEmail: 'platform@example.com',
        password: 'correct-password',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          access_token: 'platform-access-token',
          user: authUser,
        });
      });

    expect(loginUserUseCase.execute).toHaveBeenCalledWith(
      {
        usernameOrEmail: 'platform@example.com',
        password: 'correct-password',
      },
      [user_role.SUPER_ADMIN],
    );
    expect(authCookieService.setRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'platform',
      'platform-refresh-token',
    );
  });

  it('refreshes only through the platform cookie and Super Admin role', async () => {
    authCookieService.getRefreshToken.mockReturnValue('platform-refresh-token');
    refreshTokenUseCase.execute.mockResolvedValue({
      access_token: 'new-platform-access-token',
      refresh_token: 'platform-refresh-token',
    });

    await request(httpServer)
      .post('/auth/platform/refresh')
      .expect(201)
      .expect({ access_token: 'new-platform-access-token' });

    expect(authCookieService.getRefreshToken).toHaveBeenCalledWith(
      expect.anything(),
      'platform',
    );
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
      'platform-refresh-token',
      [user_role.SUPER_ADMIN],
    );
    expect(authCookieService.setRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'platform',
      'platform-refresh-token',
    );
  });

  it('clears only the platform cookies when refresh fails', async () => {
    authCookieService.getRefreshToken.mockReturnValue('expired-token');
    refreshTokenUseCase.execute.mockRejectedValue(
      new UnauthorizedError('Invalid or expired refresh token'),
    );

    await request(httpServer).post('/auth/platform/refresh').expect(401);

    expect(authCookieService.clearRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'platform',
    );
  });

  it('revokes the platform session and clears only platform cookies on logout', async () => {
    authCookieService.getRefreshToken.mockReturnValue('platform-refresh-token');
    refreshTokenUseCase.revoke.mockResolvedValue(undefined);

    await request(httpServer).post('/auth/platform/logout').expect(201);

    expect(refreshTokenUseCase.revoke).toHaveBeenCalledWith(
      'platform-refresh-token',
      [user_role.SUPER_ADMIN],
    );
    expect(authCookieService.clearRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'platform',
    );
  });
});
