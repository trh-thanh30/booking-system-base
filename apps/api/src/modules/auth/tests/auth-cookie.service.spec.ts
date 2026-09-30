import type { Request, Response } from 'express';

import { AuthCookieService } from '@/modules/auth/services/auth-cookie.service';

describe('AuthCookieService', () => {
  const cookieConfig = {
    domain: undefined,
    httpOnly: true,
    maxAge: 60_000,
    partitioned: false,
    path: '/',
    oauthCallbackPath: '/api/v1/auth/admin/google/callback',
    refreshPaths: {
      admin: '/api/v1/auth/admin',
      client: '/api/v1/auth',
      platform: '/api/v1/auth/platform',
    },
    sameSite: 'lax' as const,
    secure: false,
  };

  it('reads only the refresh token for the requested auth context', () => {
    const service = new AuthCookieService(cookieConfig);
    const req: Pick<Request, 'cookies'> = {
      cookies: {
        admin_refresh_token: 'admin-token',
        platform_refresh_token: 'platform-token',
      },
    };

    expect(service.getRefreshToken(req, 'platform')).toBe('platform-token');
    expect(service.getRefreshToken(req, 'admin')).toBe('admin-token');
    expect(service.getRefreshToken(req, 'client')).toBe('');
  });

  it('sets and clears only the platform cookie names for platform auth', () => {
    const service = new AuthCookieService(cookieConfig);
    const clearCookie = jest.fn();
    const cookie = jest.fn();
    const res: Pick<Response, 'clearCookie' | 'cookie'> = {
      clearCookie,
      cookie,
    };

    service.setRefreshCookies(res, 'platform', 'platform-token');
    service.clearRefreshCookies(res, 'platform');

    expect(cookie).toHaveBeenCalledWith(
      'platform_refresh_token',
      'platform-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/api/v1/auth/platform',
      }),
    );
    expect(cookie).toHaveBeenCalledWith(
      'platform_has_rt',
      '1',
      expect.objectContaining({ httpOnly: false }),
    );
    expect(cookie).not.toHaveBeenCalledWith(
      'admin_refresh_token',
      expect.anything(),
      expect.anything(),
    );
    expect(clearCookie).toHaveBeenCalledWith(
      'platform_refresh_token',
      expect.objectContaining({ path: '/api/v1/auth/platform' }),
    );
    expect(clearCookie).toHaveBeenCalledWith(
      'platform_has_rt',
      expect.anything(),
    );
    expect(clearCookie).not.toHaveBeenCalledWith(
      'admin_refresh_token',
      expect.anything(),
    );
  });
  it('binds Google OAuth state to a short-lived callback-only cookie', () => {
    const service = new AuthCookieService(cookieConfig);
    const clearCookie = jest.fn();
    const cookie = jest.fn();
    const res: Pick<Response, 'clearCookie' | 'cookie'> = {
      clearCookie,
      cookie,
    };
    const req: Pick<Request, 'cookies'> = {
      cookies: { admin_google_oauth_state: 'oauth-state' },
    };

    expect(service.getGoogleOAuthStateCookie(req)).toBe('oauth-state');
    service.setGoogleOAuthStateCookie(res, 'oauth-state', 600);
    service.clearGoogleOAuthStateCookie(res);

    expect(cookie).toHaveBeenCalledWith(
      'admin_google_oauth_state',
      'oauth-state',
      expect.objectContaining({
        httpOnly: true,
        maxAge: 600_000,
        path: '/api/v1/auth/admin/google/callback',
        sameSite: 'lax',
      }),
    );
    expect(clearCookie).toHaveBeenCalledWith(
      'admin_google_oauth_state',
      expect.objectContaining({
        path: '/api/v1/auth/admin/google/callback',
      }),
    );
  });
});
