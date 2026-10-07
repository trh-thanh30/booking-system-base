import { Body, Controller, Post, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Public } from '@/common/decorators/public.decorator';
import { ApiSuccess } from '@/common/decorators';
import { AuthCookieService } from '../services/auth-cookie.service';
import { CheckOwnerContactUseCase } from '../use-cases/check-owner-contact.usecase';
import { CheckOwnerContactDto } from '../dto/check-owner-contact.dto';

@Public()
@Controller(['auth/admin/onboarding', 'auth/admin/google/onboarding'])
export class OwnerContactController {
  constructor(
    private readonly check: CheckOwnerContactUseCase,
    private readonly cookies: AuthCookieService,
  ) {}

  @Post('check-contact')
  @ApiSuccess('Contact availability checked')
  checkContact(@Body() input: CheckOwnerContactDto, @Req() request: Request) {
    return this.check.execute(
      {
        emailToken: this.cookies.getOwnerOnboardingCookie(request),
        googleToken: this.cookies.getGoogleOnboardingCookie(request),
      },
      input,
    );
  }
}
