import { UnauthorizedError } from '@/common/response';
import { googleOAuthConfig } from '@/config';
import { GoogleAuthController } from '@/modules/auth/controllers/google-auth.controller';
import { AuthCookieService } from '@/modules/auth/services/auth-cookie.service';
import { AuthProfileService } from '@/modules/auth/services/auth-profile.service';
import { GoogleOnboardingSessionService } from '@/modules/auth/services/google-onboarding-session.service';
import { CompleteGoogleOwnerOnboardingUseCase } from '@/modules/auth/use-cases/complete-google-owner-onboarding.usecase';
import { LoginWithGoogleUseCase } from '@/modules/auth/use-cases/login-with-google.usecase';
import { StartGoogleLoginUseCase } from '@/modules/auth/use-cases/start-google-login.usecase';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import cookieParser from 'cookie-parser';
import request from 'supertest';
import type { App } from 'supertest/types';

describe('GoogleAuthController', () => {
  let app: INestApplication<App>;
  let httpServer: App;

  const startGoogleLoginUseCase = { execute: jest.fn() };
  const loginWithGoogleUseCase = { execute: jest.fn() };
  const completeOnboardingUseCase = { execute: jest.fn() };
  const authProfileService = { getByUserId: jest.fn() };
  const onboardingSessionService = { get: jest.fn() };
  const authCookieService = {
    clearGoogleOAuthStateCookie: jest.fn(),
    clearGoogleOnboardingCookie: jest.fn(),
    clearRefreshCookies: jest.fn(),
    getGoogleOAuthStateCookie: jest.fn(),
    getGoogleOnboardingCookie: jest.fn(),
    setGoogleOnboardingCookie: jest.fn(),
    setGoogleOAuthStateCookie: jest.fn(),
    setRefreshCookies: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const moduleRef = await Test.createTestingModule({
      controllers: [GoogleAuthController],
      providers: [
        {
          provide: StartGoogleLoginUseCase,
          useValue: startGoogleLoginUseCase,
        },
        {
          provide: LoginWithGoogleUseCase,
          useValue: loginWithGoogleUseCase,
        },
        { provide: AuthCookieService, useValue: authCookieService },
        { provide: AuthProfileService, useValue: authProfileService },
        {
          provide: CompleteGoogleOwnerOnboardingUseCase,
          useValue: completeOnboardingUseCase,
        },
        {
          provide: GoogleOnboardingSessionService,
          useValue: onboardingSessionService,
        },
        {
          provide: googleOAuthConfig.KEY,
          useValue: { adminUrl: 'http://localhost:3001' },
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useLogger(false);
    await app.init();
    httpServer = app.getHttpServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it('starts Google authorization and binds state to an HttpOnly cookie', async () => {
    startGoogleLoginUseCase.execute.mockResolvedValue({
      authorizationUrl: 'https://accounts.google.com/o/oauth2/v2/auth?state=s',
      state: 'oauth-state',
      stateTtlSeconds: 600,
    });

    await request(httpServer)
      .get('/auth/admin/google?locale=en&returnTo=%2Fbusinesses')
      .expect(302)
      .expect(
        'location',
        'https://accounts.google.com/o/oauth2/v2/auth?state=s',
      );

    expect(startGoogleLoginUseCase.execute).toHaveBeenCalledWith({
      locale: 'en',
      returnTo: '/businesses',
    });
    expect(authCookieService.setGoogleOAuthStateCookie).toHaveBeenCalledWith(
      expect.anything(),
      'oauth-state',
      600,
    );
  });

  it('sets only the admin refresh cookie and redirects after a successful callback', async () => {
    authCookieService.getGoogleOAuthStateCookie.mockReturnValue('oauth-state');
    loginWithGoogleUseCase.execute.mockResolvedValue({
      locale: 'en',
      refresh_token: 'refresh-token',
      returnTo: '/businesses',
    });

    await request(httpServer)
      .get('/auth/admin/google/callback?code=code&state=oauth-state')
      .expect(302)
      .expect('location', 'http://localhost:3001/en/businesses');

    expect(loginWithGoogleUseCase.execute).toHaveBeenCalledWith({
      code: 'code',
      state: 'oauth-state',
      stateCookie: 'oauth-state',
    });
    expect(authCookieService.clearGoogleOAuthStateCookie).toHaveBeenCalled();
    expect(authCookieService.setRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'admin',
      'refresh-token',
    );
  });

  it('redirects a first-time Google Owner to business onboarding', async () => {
    authCookieService.getGoogleOAuthStateCookie.mockReturnValue('oauth-state');
    loginWithGoogleUseCase.execute.mockResolvedValue({
      locale: 'en',
      onboardingToken: 'onboarding-token',
      onboardingTtlSeconds: 900,
      returnTo: '/dashboard',
      status: 'onboarding_required',
    });

    await request(httpServer)
      .get('/auth/admin/google/callback?code=code&state=oauth-state')
      .expect(302)
      .expect('location', 'http://localhost:3001/en/onboarding/business');

    expect(authCookieService.setGoogleOnboardingCookie).toHaveBeenCalledWith(
      expect.anything(),
      'onboarding-token',
      900,
    );
    expect(authCookieService.setRefreshCookies).not.toHaveBeenCalled();
  });

  it('returns the verified Google profile for an active onboarding session', async () => {
    authCookieService.getGoogleOnboardingCookie.mockReturnValue(
      'onboarding-token',
    );
    onboardingSessionService.get.mockResolvedValue({
      avatarUrl: 'https://example.com/avatar.png',
      email: 'owner@example.com',
      fullName: 'Business Owner',
      locale: 'vi',
      providerAccountId: 'google-subject',
      returnTo: '/dashboard',
    });

    await request(httpServer)
      .get('/auth/admin/google/onboarding')
      .expect(200)
      .expect({
        avatar_url: 'https://example.com/avatar.png',
        email: 'owner@example.com',
        full_name: 'Business Owner',
      });

    expect(onboardingSessionService.get).toHaveBeenCalledWith(
      'onboarding-token',
    );
  });

  it('completes onboarding and issues an admin session', async () => {
    authCookieService.getGoogleOnboardingCookie.mockReturnValue(
      'onboarding-token',
    );
    completeOnboardingUseCase.execute.mockResolvedValue({
      access_token: 'access-token',
      locale: 'vi',
      returnTo: '/dashboard',
      refresh_token: 'refresh-token',
      owner: { id: 'owner-id' },
    });
    authProfileService.getByUserId.mockResolvedValue({ id: 'owner-id' });
    const body = {
      slug: 'demo-spa',
      name: 'Demo Spa',
      owner: { username: 'owner' },
    };

    await request(httpServer)
      .post('/auth/admin/google/onboarding')
      .send(body)
      .expect(201)
      .expect({
        access_token: 'access-token',
        locale: 'vi',
        return_to: '/dashboard',
        user: { id: 'owner-id' },
      });

    expect(completeOnboardingUseCase.execute).toHaveBeenCalledWith(
      'onboarding-token',
      body,
    );
    expect(authCookieService.clearGoogleOnboardingCookie).toHaveBeenCalled();
    expect(authCookieService.setRefreshCookies).toHaveBeenCalledWith(
      expect.anything(),
      'admin',
      'refresh-token',
    );
  });

  it('clears partial cookies and redirects with a safe code when callback fails', async () => {
    authCookieService.getGoogleOAuthStateCookie.mockReturnValue('oauth-state');
    loginWithGoogleUseCase.execute.mockRejectedValue(
      new UnauthorizedError(
        'No matching account',
        'GOOGLE_ACCOUNT_NOT_REGISTERED',
      ),
    );

    await request(httpServer)
      .get('/auth/admin/google/callback?code=code&state=oauth-state')
      .expect(302)
      .expect(
        'location',
        'http://localhost:3001/vi/login?oauthError=GOOGLE_ACCOUNT_NOT_REGISTERED',
      );

    expect(authCookieService.clearGoogleOAuthStateCookie).toHaveBeenCalled();
    expect(authCookieService.clearRefreshCookies).not.toHaveBeenCalled();
    expect(authCookieService.setRefreshCookies).not.toHaveBeenCalled();
  });
});
