import { ConflictError, UnauthorizedError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { GoogleOAuthProvider } from '@/modules/auth/providers/google-oauth.provider';
import { AuthTokenService } from '@/modules/auth/services/auth-token.service';
import { GoogleOnboardingSessionService } from '@/modules/auth/services/google-onboarding-session.service';
import { GoogleOAuthStateService } from '@/modules/auth/services/google-oauth-state.service';
import { RefreshTokenSessionService } from '@/modules/auth/services/refresh-token-session.service';
import { Injectable } from '@nestjs/common';
import {
  identity_provider,
  Prisma,
  user_role,
  user_status,
  type User,
} from '@prisma/client';

type GoogleCallbackInput = {
  code?: string;
  error?: string;
  state: string;
  stateCookie: string;
};

@Injectable()
export class LoginWithGoogleUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly googleOAuthProvider: GoogleOAuthProvider,
    private readonly stateService: GoogleOAuthStateService,
    private readonly tokenService: AuthTokenService,
    private readonly refreshTokenSessionService: RefreshTokenSessionService,
    private readonly onboardingSessionService: GoogleOnboardingSessionService,
  ) {}

  async execute(input: GoogleCallbackInput) {
    const oauthSession = await this.stateService.consume(
      input.state,
      input.stateCookie,
    );

    if (input.error) {
      throw new UnauthorizedError(
        'Google authentication was cancelled',
        'GOOGLE_AUTH_CANCELLED',
      );
    }
    if (!input.code) {
      throw new UnauthorizedError(
        'Google authorization code is missing',
        'GOOGLE_AUTH_CODE_MISSING',
      );
    }

    const profile = await this.googleOAuthProvider.exchangeCode({
      code: input.code,
      codeVerifier: oauthSession.codeVerifier,
      nonce: oauthSession.nonce,
    });
    const existingIdentity = await this.prismaService.userIdentity.findUnique({
      where: {
        provider_provider_account_id: {
          provider: identity_provider.GOOGLE,
          provider_account_id: profile.subject,
        },
      },
      include: { user: true },
    });
    const user =
      existingIdentity?.user ??
      (await this.prismaService.user.findUnique({
        where: { email: profile.email },
      }));

    if (!user) {
      const onboarding = await this.onboardingSessionService.create({
        avatarUrl: profile.picture,
        email: profile.email,
        fullName: profile.name,
        locale: oauthSession.locale,
        providerAccountId: profile.subject,
        returnTo: oauthSession.returnTo,
      });
      return {
        locale: oauthSession.locale,
        onboardingToken: onboarding.token,
        onboardingTtlSeconds: onboarding.ttlSeconds,
        returnTo: oauthSession.returnTo,
        status: 'onboarding_required' as const,
      };
    }

    this.assertOwnerCanLogin(user);

    try {
      return await this.prismaService.$transaction(async (transaction) => {
        if (existingIdentity) {
          await transaction.userIdentity.update({
            where: { id: existingIdentity.id },
            data: { provider_email: profile.email },
          });
        } else {
          const userGoogleIdentity = await transaction.userIdentity.findFirst({
            where: {
              user_id: user.id,
              provider: identity_provider.GOOGLE,
            },
          });
          if (userGoogleIdentity) {
            throw new ConflictError(
              'This Owner account is already linked to another Google identity',
              'GOOGLE_IDENTITY_CONFLICT',
            );
          }
          await transaction.userIdentity.create({
            data: {
              provider: identity_provider.GOOGLE,
              provider_account_id: profile.subject,
              provider_email: profile.email,
              user_id: user.id,
            },
          });
        }

        const tokens = this.tokenService.generateTokenPair(
          {
            id: user.id,
            tenant_id: user.tenant_id,
            email: user.email,
            role: user.role,
            status: user.status,
            username: user.username,
          },
          'admin',
        );
        const updatedUser = await transaction.user.update({
          where: { id: user.id },
          data: {
            avatar_url: user.avatar_url || profile.picture,
            full_name: user.full_name || profile.name,
            is_verified: true,
            refresh_token_hash: this.refreshTokenSessionService.hash(
              tokens.refresh_token,
            ),
          },
        });

        return {
          ...tokens,
          status: 'authenticated' as const,
          locale: oauthSession.locale,
          returnTo: oauthSession.returnTo,
          user: updatedUser,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictError(
          'Google identity is already linked to another account',
          'GOOGLE_IDENTITY_CONFLICT',
        );
      }
      throw error;
    }
  }

  private assertOwnerCanLogin(user: User): void {
    if (user.role !== user_role.OWNER || !user.tenant_id) {
      throw new UnauthorizedError(
        'Google login is only available to an existing Owner account',
        'GOOGLE_OWNER_REQUIRED',
      );
    }
    if (user.status !== user_status.ACTIVE) {
      throw new UnauthorizedError(
        'Owner account is inactive',
        'GOOGLE_ACCOUNT_INACTIVE',
      );
    }
  }
}
