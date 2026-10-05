import { Public } from '@/common/decorators/public.decorator';
import { BaseClientError } from '@/common/response';
import { googleOAuthConfig } from '@/config';
import { CompleteGoogleOwnerOnboardingDto } from '@/modules/auth/dto/complete-google-owner-onboarding.dto';
import {
  GoogleOAuthCallbackDto,
  StartGoogleOAuthDto,
} from '@/modules/auth/dto/google-oauth.dto';
import { AuthCookieService } from '@/modules/auth/services/auth-cookie.service';
import { AuthProfileService } from '@/modules/auth/services/auth-profile.service';
import { GoogleOnboardingSessionService } from '@/modules/auth/services/google-onboarding-session.service';
import { CompleteGoogleOwnerOnboardingUseCase } from '@/modules/auth/use-cases/complete-google-owner-onboarding.usecase';
import { LoginWithGoogleUseCase } from '@/modules/auth/use-cases/login-with-google.usecase';
import { StartGoogleLoginUseCase } from '@/modules/auth/use-cases/start-google-login.usecase';
import {
  Body,
  Controller,
  Get,
  Inject,
  Logger,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Request, Response } from 'express';
import { getSafeAdminReturnTo } from '@repo/shared';

@Public()
@Controller('auth/admin/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly startGoogleLoginUseCase: StartGoogleLoginUseCase,
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
    private readonly authCookieService: AuthCookieService,
    private readonly onboardingSessionService: GoogleOnboardingSessionService,
    private readonly completeOnboardingUseCase: CompleteGoogleOwnerOnboardingUseCase,
    private readonly authProfileService: AuthProfileService,
    @Inject(googleOAuthConfig.KEY)
    private readonly config: ConfigType<typeof googleOAuthConfig>,
  ) {}

  @Get()
  async authorize(
    @Query() query: StartGoogleOAuthDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.startGoogleLoginUseCase.execute(query);
    this.authCookieService.clearGoogleOnboardingCookie(response);
    this.authCookieService.setGoogleOAuthStateCookie(
      response,
      result.state,
      result.stateTtlSeconds,
    );
    response.redirect(result.authorizationUrl);
  }

  @Get('onboarding')
  async getOnboardingProfile(@Req() request: Request) {
    const session = await this.onboardingSessionService.get(
      this.authCookieService.getGoogleOnboardingCookie(request),
    );
    return {
      avatar_url: session.avatarUrl ?? null,
      email: session.email,
      full_name: session.fullName ?? null,
    };
  }

  @Post('onboarding')
  async completeOnboarding(
    @Body() dto: CompleteGoogleOwnerOnboardingDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.completeOnboardingUseCase.execute(
      this.authCookieService.getGoogleOnboardingCookie(request),
      dto,
    );
    this.authCookieService.clearGoogleOnboardingCookie(response);
    this.authCookieService.setRefreshCookies(
      response,
      'admin',
      result.refresh_token,
    );
    return {
      access_token: result.access_token,
      locale: result.locale,
      return_to: getSafeAdminReturnTo(result.returnTo),
      user: await this.authProfileService.getByUserId(result.owner.id),
    };
  }

  @Get('callback')
  async callback(
    @Query() query: GoogleOAuthCallbackDto,
    @Req() request: Request,
    @Res() response: Response,
  ): Promise<void> {
    try {
      const result = await this.loginWithGoogleUseCase.execute({
        ...query,
        stateCookie: this.authCookieService.getGoogleOAuthStateCookie(request),
      });

      this.authCookieService.clearGoogleOAuthStateCookie(response);
      if (result.status === 'onboarding_required') {
        this.authCookieService.setGoogleOnboardingCookie(
          response,
          result.onboardingToken,
          result.onboardingTtlSeconds,
        );
        response.redirect(
          this.createAdminUrl(result.locale, '/admin/onboarding/business'),
        );
        return;
      }

      this.authCookieService.clearGoogleOnboardingCookie(response);
      this.authCookieService.setRefreshCookies(
        response,
        'admin',
        result.refresh_token,
      );
      response.redirect(
        this.createAdminUrl(
          result.locale,
          getSafeAdminReturnTo(result.returnTo),
        ),
      );
    } catch (error) {
      this.authCookieService.clearGoogleOAuthStateCookie(response);
      const errorCode =
        error instanceof BaseClientError
          ? error.code
          : 'GOOGLE_AUTH_UNAVAILABLE';
      this.logger.warn(`Google login failed with code ${errorCode}`);
      response.redirect(
        this.createAdminUrl('vi', '/admin/login', { oauthError: errorCode }),
      );
    }
  }

  private createAdminUrl(
    locale: 'vi' | 'en',
    pathname: string,
    searchParams: Record<string, string> = {},
  ): string {
    const url = new URL(`/${locale}${pathname}`, this.config.adminUrl);
    for (const [key, value] of Object.entries(searchParams)) {
      url.searchParams.set(key, value);
    }
    return url.toString();
  }
}
