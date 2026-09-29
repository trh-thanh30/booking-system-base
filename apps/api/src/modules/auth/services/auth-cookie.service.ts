import { cookieConfig } from '@/config';
import type { AuthContext } from '@/modules/auth/auth.types';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Request, Response } from 'express';

type CookieRequest = Pick<Request, 'cookies'>;
type CookieResponse = Pick<Response, 'clearCookie' | 'cookie'>;

@Injectable()
export class AuthCookieService {
  constructor(
    @Inject(cookieConfig.KEY)
    private readonly configCookie: ConfigType<typeof cookieConfig>,
  ) {}

  getRefreshToken(req: CookieRequest, context: AuthContext) {
    const { refreshToken } = this.getRefreshCookieNames(context);
    return (
      (req.cookies as Record<string, string> | undefined)?.[refreshToken] ?? ''
    );
  }

  setRefreshCookies(
    res: CookieResponse,
    context: AuthContext,
    refreshToken: string,
  ) {
    const cookieNames = this.getRefreshCookieNames(context);
    this.clearPartitionedRefreshCookies(res, context);

    res.cookie(cookieNames.refreshToken, refreshToken, {
      httpOnly: this.configCookie.httpOnly,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      maxAge: this.configCookie.maxAge,
      partitioned: this.configCookie.partitioned,
    });
    res.cookie(cookieNames.refreshFlag, '1', {
      httpOnly: false,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      maxAge: this.configCookie.maxAge,
    });

    this.clearLegacyRefreshCookies(res);
  }

  clearRefreshCookies(res: CookieResponse, context: AuthContext) {
    const cookieNames = this.getRefreshCookieNames(context);

    res.clearCookie(cookieNames.refreshToken, {
      httpOnly: this.configCookie.httpOnly,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      partitioned: this.configCookie.partitioned,
    });
    res.clearCookie(cookieNames.refreshFlag, {
      httpOnly: false,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
    });

    this.clearLegacyRefreshCookies(res);
  }

  private getRefreshCookieNames(context: AuthContext) {
    if (context === 'platform') {
      return {
        refreshToken: 'platform_refresh_token',
        refreshFlag: 'platform_has_rt',
      };
    }

    if (context === 'admin') {
      return {
        refreshToken: 'admin_refresh_token',
        refreshFlag: 'admin_has_rt',
      };
    }

    return {
      refreshToken: 'client_refresh_token',
      refreshFlag: 'client_has_rt',
    };
  }

  private clearPartitionedRefreshCookies(
    res: CookieResponse,
    context: AuthContext,
  ) {
    const cookieNames = this.getRefreshCookieNames(context);

    res.clearCookie(cookieNames.refreshToken, {
      httpOnly: this.configCookie.httpOnly,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      partitioned: true,
    });
    res.clearCookie(cookieNames.refreshFlag, {
      httpOnly: false,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      partitioned: true,
    });
  }

  private clearLegacyRefreshCookies(res: CookieResponse) {
    res.clearCookie('refresh_token', {
      httpOnly: this.configCookie.httpOnly,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
      partitioned: this.configCookie.partitioned,
    });
    res.clearCookie('has_rt', {
      httpOnly: false,
      secure: this.configCookie.secure,
      sameSite: this.configCookie.sameSite,
      domain: this.configCookie.domain,
      path: this.configCookie.path,
    });
  }
}
