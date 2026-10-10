import { Public } from '@/common/decorators/public.decorator';
import { ApiSuccess } from '@/common/decorators';
import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthCookieService } from '../services/auth-cookie.service';
import { OwnerBusinessOnboardingUseCase } from '../use-cases/owner-business-onboarding.usecase';
import { RegisterOwnerAccountUseCase } from '../use-cases/register-owner-account.usecase';
import { RegisterOwnerAccountDto } from '../dto/register-owner-account.dto';
import { VerifyEmailDto } from '../dto/verify-email.dto';
import { LoginDto } from '../dto/login.dto';
import { CompleteOwnerBusinessDto } from '../dto/complete-owner-business.dto';
import { CheckBusinessSlugDto } from '../dto/check-business-slug.dto';
import { CheckOwnerBusinessSlugUseCase } from '../use-cases/check-owner-business-slug.usecase';
import { AuthProfileService } from '../services/auth-profile.service';

@Public()
@Controller('auth/admin/onboarding')
export class OwnerOnboardingController {
  constructor(
    private readonly onboarding: OwnerBusinessOnboardingUseCase,
    private readonly registration: RegisterOwnerAccountUseCase,
    private readonly cookies: AuthCookieService,
    private readonly checkBusinessSlug: CheckOwnerBusinessSlugUseCase,
    private readonly profiles: AuthProfileService,
  ) {}

  @Post('register')
  @ApiSuccess('Account created. Verify your email.')
  register(@Body() input: RegisterOwnerAccountDto) {
    return this.registration.execute(input);
  }

  @Post('verify')
  @ApiSuccess('Email verified')
  async verify(
    @Body() input: VerifyEmailDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.onboarding.verify(input);
    if (token) this.cookies.setOwnerOnboardingCookie(response, token, 1800);
    return { onboarding_required: Boolean(token) };
  }

  @Post('login')
  @ApiSuccess('Continue business onboarding')
  async resume(
    @Body() input: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = await this.onboarding.resume(input);
    this.cookies.setOwnerOnboardingCookie(response, token, 1800);
    return { onboarding_required: true };
  }

  @Get()
  @ApiSuccess('Verified owner profile')
  profile(@Req() request: Request) {
    return this.onboarding.profile(
      this.cookies.getOwnerOnboardingCookie(request),
    );
  }

  @Get('check-slug')
  @ApiSuccess('Business URL availability checked')
  checkSlug(@Query() input: CheckBusinessSlugDto) {
    return this.checkBusinessSlug.execute(input.slug);
  }

  @Post()
  @ApiSuccess('Business onboarding complete')
  async complete(
    @Body() input: CompleteOwnerBusinessDto,
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = await this.onboarding.execute(
      this.cookies.getOwnerOnboardingCookie(request),
      input,
    );
    this.cookies.clearOwnerOnboardingCookie(response);
    this.cookies.setRefreshCookies(response, 'admin', result.refresh_token);
    return {
      access_token: result.access_token,
      user: await this.profiles.getByUserId(result.owner.id),
    };
  }
}
