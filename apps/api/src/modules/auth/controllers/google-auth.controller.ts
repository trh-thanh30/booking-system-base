import { Public } from '@/common/decorators/public.decorator';
import { BaseClientError } from '@/common/response';
import { googleOAuthConfig } from '@/config';
import {
  GoogleOAuthCallbackDto,
  StartGoogleOAuthDto,
} from '@/modules/auth/dto/google-oauth.dto';
import { AuthCookieService } from '@/modules/auth/services/auth-cookie.service';
import { LoginWithGoogleUseCase } from '@/modules/auth/use-cases/login-with-google.usecase';
import { StartGoogleLoginUseCase } from '@/modules/auth/use-cases/start-google-login.usecase';
import {
  Controller,
  Get,
  Inject,
  Logger,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import type { Request, Response } from 'express';

@Public()
@Controller('auth/admin/google')
export class GoogleAuthController {
  private readonly logger = new Logger(GoogleAuthController.name);

  constructor(
    private readonly startGoogleLoginUseCase: StartGoogleLoginUseCase,
    private readonly loginWithGoogleUseCase: LoginWithGoogleUseCase,
    private readonly authCookieService: AuthCookieService,
    @Inject(googleOAuthConfig.KEY)
    private readonly config: ConfigType<typeof googleOAuthConfig>,
  ) {}

  @Get()
  async authorize(
    @Query() query: StartGoogleOAuthDto,
    @Res() response: Response,
  ): Promise<void> {
    const result = await this.startGoogleLoginUseCase.execute(query);
    this.authCookieService.setGoogleOAuthStateCookie(
      response,
      result.state,
      result.stateTtlSeconds,
    );
    response.redirect(result.authorizationUrl);
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
      this.authCookieService.setRefreshCookies(
        response,
        'admin',
        result.refresh_token,
      );
      response.redirect(this.createAdminUrl(result.locale, result.returnTo));
    } catch (error) {
      this.authCookieService.clearGoogleOAuthStateCookie(response);
      const errorCode =
        error instanceof BaseClientError
          ? error.code
          : 'GOOGLE_AUTH_UNAVAILABLE';
      this.logger.warn(`Google login failed with code ${errorCode}`);
      response.redirect(
        this.createAdminUrl('vi', '/login', { oauthError: errorCode }),
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
