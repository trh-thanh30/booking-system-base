import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { user_role, user_status } from '@prisma/client';
import request from 'supertest';
import type { App } from 'supertest/types';

import { UnauthorizedError } from '@/common/response';
import { AdminAuthController } from '@/modules/auth/controllers/admin-auth.controller';
import { AuthCookieService } from '@/modules/auth/services/auth-cookie.service';
import { AuthProfileService } from '@/modules/auth/services/auth-profile.service';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';

describe('AdminAuthController', () => {
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
      controllers: [AdminAuthController],
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

  it('logs an Owner or Staff user in through the admin-specific route', async () => {
    const user = {
      id: 'owner-user-id',
      email: 'owner@example.com',
      username: 'business-owner',
      password: 'hashed-password',
      full_name: 'Business Owner',
      phone: null,
      avatar_url: null,
      tenant_id: 'tenant-id',
      role: user_role.OWNER,
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
      tenant: { id: 'tenant-id', name: 'Demo tenant', slug: 'demo-tenant' },
      businesses: [],
      permissions: ['*'],
      created_at: user.created_at.toISOString(),
      updated_at: user.updated_at.toISOString(),
    };

    loginUserUseCase.execute.mockResolvedValue({
      access_token: 'admin-access-token',
      refresh_token: 'admin-refresh-token',
      user,
    });
    authProfileService.getByUserId.mockResolvedValue(authUser);

    await request(httpServer)
      .post('/auth/admin/login')
      .send({
        usernameOrEmail: 'owner@example.com',
        password: 'correct-password',
      })
      .expect(201)
      .expect(({ body }) => {
        expect(body).toEqual({
          access_token: 'admin-access-token',
          user: authUser,
        });
      });

    expect(loginUserUseCase.execute).toHaveBeenCalledWith(
      {
        usernameOrEmail: 'owner@example.com',
        password: 'correct-password',
      },
      [user_role.OWNER, user_role.STAFF],
    );
    expect(authCookieService.setRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'admin',
      'admin-refresh-token',
    );
  });

  it('refreshes only through the admin cookie and Owner or Staff roles', async () => {
    authCookieService.getRefreshToken.mockReturnValue('admin-refresh-token');
    refreshTokenUseCase.execute.mockResolvedValue({
      access_token: 'new-admin-access-token',
      refresh_token: 'admin-refresh-token',
    });

    await request(httpServer)
      .post('/auth/admin/refresh')
      .expect(201)
      .expect({ access_token: 'new-admin-access-token' });

    expect(authCookieService.getRefreshToken).toHaveBeenCalledWith(
      expect.anything(),
      'admin',
    );
    expect(refreshTokenUseCase.execute).toHaveBeenCalledWith(
      'admin-refresh-token',
      [user_role.OWNER, user_role.STAFF],
    );
    expect(authCookieService.setRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'admin',
      'admin-refresh-token',
    );
  });

  it('clears only the admin cookies when refresh fails', async () => {
    authCookieService.getRefreshToken.mockReturnValue('expired-token');
    refreshTokenUseCase.execute.mockRejectedValue(
      new UnauthorizedError('Invalid or expired refresh token'),
    );

    await request(httpServer).post('/auth/admin/refresh').expect(401);

    expect(authCookieService.clearRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'admin',
    );
  });

  it('revokes the admin session and clears only admin cookies on logout', async () => {
    authCookieService.getRefreshToken.mockReturnValue('admin-refresh-token');
    refreshTokenUseCase.revoke.mockResolvedValue(undefined);

    await request(httpServer).post('/auth/admin/logout').expect(201);

    expect(refreshTokenUseCase.revoke).toHaveBeenCalledWith(
      'admin-refresh-token',
      [user_role.OWNER, user_role.STAFF],
    );
    expect(authCookieService.clearRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'admin',
    );
  });
});
