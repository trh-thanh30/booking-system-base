import { ApiSuccess } from '@/common/decorators';
import { Public } from '@/common/decorators/public.decorator';
import { LoginDto } from '@/modules/auth/dto/login.dto';
import { AuthCookieService } from '@/modules/auth/services/auth-cookie.service';
import { AuthProfileService } from '@/modules/auth/services/auth-profile.service';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';
import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { user_role } from '@prisma/client';
import type { Request, Response } from 'express';

const PLATFORM_ROLES = [user_role.SUPER_ADMIN];

@Public()
@Controller('auth/platform')
export class PlatformAuthController {
  constructor(
    private readonly loginUserUseCase: LoginUserUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly authCookieService: AuthCookieService,
    private readonly authProfileService: AuthProfileService,
  ) {}

  @Post('login')
  @ApiSuccess('Platform login successful')
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.loginUserUseCase.execute(
      dto,
      PLATFORM_ROLES,
      'platform',
    );
    this.authCookieService.setRefreshCookies(
      res,
      'platform',
      result.refresh_token,
    );

    return {
      access_token: result.access_token,
      user: await this.authProfileService.getByUserId(result.user.id),
    };
  }

  @Post('refresh')
  @ApiSuccess('Platform token refreshed successfully')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ access_token: string }> {
    const refreshToken = this.authCookieService.getRefreshToken(
      req,
      'platform',
    );

    try {
      const result = await this.refreshTokenUseCase.execute(
        refreshToken,
        PLATFORM_ROLES,
        'platform',
      );
      return { access_token: result.access_token };
    } catch (error) {
      this.authCookieService.clearRefreshCookies(res, 'platform');
      throw error;
    }
  }

  @Post('logout')
  @ApiSuccess('Platform logged out successfully')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.authCookieService.getRefreshToken(
      req,
      'platform',
    );
    await this.refreshTokenUseCase.revoke(
      refreshToken,
      PLATFORM_ROLES,
      'platform',
    );
    this.authCookieService.clearRefreshCookies(res, 'platform');
  }
}
