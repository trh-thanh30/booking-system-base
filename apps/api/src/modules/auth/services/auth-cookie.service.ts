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

  getGoogleOAuthStateCookie(req: CookieRequest): string {
    return (
      (req.cookies as Record<string, string> | undefined)
        ?.admin_google_oauth_state ?? ''
    );
  }

  setGoogleOAuthStateCookie(
    res: CookieResponse,
    state: string,
    ttlSeconds: number,
  ): void {
    res.cookie('admin_google_oauth_state', state, {
      httpOnly: true,
      secure: this.configCookie.secure,
      sameSite: 'lax',
      domain: this.configCookie.domain,
      path: this.configCookie.oauthCallbackPath,
      maxAge: ttlSeconds * 1000,
    });
  }

  clearGoogleOAuthStateCookie(res: CookieResponse): void {
    res.clearCookie('admin_google_oauth_state', {
      httpOnly: true,
      secure: this.configCookie.secure,
      sameSite: 'lax',
      domain: this.configCookie.domain,
      path: this.configCookie.oauthCallbackPath,
    });
  }

  getGoogleOnboardingCookie(req: CookieRequest): string {
    return (
      (req.cookies as Record<string, string> | undefined)
        ?.admin_google_onboarding ?? ''
    );
  }

  setGoogleOnboardingCookie(
    res: CookieResponse,
    token: string,
    ttlSeconds: number,
  ): void {
    res.cookie('admin_google_onboarding', token, {
      httpOnly: true,
      secure: this.configCookie.secure,
      sameSite: 'lax',
      domain: this.configCookie.domain,
      path: this.configCookie.googleOnboardingPath,
      maxAge: ttlSeconds * 1000,
    });
  }

  clearGoogleOnboardingCookie(res: CookieResponse): void {
    res.clearCookie('admin_google_onboarding', {
      httpOnly: true,
      secure: this.configCookie.secure,
      sameSite: 'lax',
      domain: this.configCookie.domain,
      path: this.configCookie.googleOnboardingPath,
    });
  }

  getOwnerOnboardingCookie(req: CookieRequest): string {
    return (
      (req.cookies as Record<string, string> | undefined)
        ?.admin_owner_onboarding ?? ''
    );
  }

  setOwnerOnboardingCookie(
    res: CookieResponse,
    token: string,
    ttlSeconds: number,
  ): void {
    res.cookie('admin_owner_onboarding', token, {
      httpOnly: true,
      secure: this.configCookie.secure,
      sameSite: 'lax',
      domain: this.configCookie.domain,
      path: this.configCookie.refreshPaths.admin + '/onboarding',
      maxAge: ttlSeconds * 1000,
    });
  }

  clearOwnerOnboardingCookie(res: CookieResponse): void {
    res.clearCookie('admin_owner_onboarding', {
      httpOnly: true,
      secure: this.configCookie.secure,
      sameSite: 'lax',
      domain: this.configCookie.domain,
      path: this.configCookie.refreshPaths.admin + '/onboarding',
    });
  }

  getRefreshToken(req: CookieRequest, context: AuthContext) {
    const { refreshToken } = this.getRefreshCookieNames(context);
    return (
      (req.cookies as Record<string, string> | undefined)?.[refreshToken] ?? ''
    );
  }

  private getRefreshPath(context: AuthContext): string {
    return this.configCookie.refreshPaths[context];
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
      path: this.getRefreshPath(context),
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
      path: this.getRefreshPath(context),
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
      path: this.getRefreshPath(context),
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
