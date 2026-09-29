import type { Request, Response } from 'express';

import { AuthCookieService } from '@/modules/auth/service/auth-cookie.service';

describe('AuthCookieService', () => {
  const cookieConfig = {
    domain: undefined,
    httpOnly: true,
    maxAge: 60_000,
    partitioned: false,
    path: '/',
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
      expect.objectContaining({ httpOnly: true }),
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
      expect.anything(),
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
});
