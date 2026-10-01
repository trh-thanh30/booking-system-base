import { ConflictError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CompleteGoogleOwnerOnboardingDto } from '@/modules/auth/dto/complete-google-owner-onboarding.dto';
import { AuthTokenService } from '@/modules/auth/services/auth-token.service';
import { GoogleOnboardingSessionService } from '@/modules/auth/services/google-onboarding-session.service';
import { RefreshTokenSessionService } from '@/modules/auth/services/refresh-token-session.service';
import { CreateTenantWorkspaceUseCase } from '@/modules/tenant/use-cases/create-tenant-workspace.use-case';
import { UsersService } from '@/modules/user/user.service';
import { Injectable, Logger } from '@nestjs/common';
import { identity_provider } from '@prisma/client';

@Injectable()
export class CompleteGoogleOwnerOnboardingUseCase {
  private readonly logger = new Logger(
    CompleteGoogleOwnerOnboardingUseCase.name,
  );

  constructor(
    private readonly prismaService: PrismaService,
    private readonly usersService: UsersService,
    private readonly createTenantWorkspaceUseCase: CreateTenantWorkspaceUseCase,
    private readonly onboardingSessionService: GoogleOnboardingSessionService,
    private readonly tokenService: AuthTokenService,
    private readonly refreshTokenSessionService: RefreshTokenSessionService,
  ) {}

  async execute(token: string, dto: CompleteGoogleOwnerOnboardingDto) {
    const session = await this.onboardingSessionService.get(token);
    await this.assertIdentityIsUnique(
      session.email,
      session.providerAccountId,
      dto.owner.username,
      dto.owner.phone,
    );

    const workspace = await this.createTenantWorkspaceUseCase.execute({
      tenant: {
        slug: dto.slug,
        name: dto.name,
        timezone: dto.timezone,
        locale: dto.locale ?? session.locale,
        primaryDomain: dto.primary_domain,
        defaultBusinessName: dto.default_business_name,
        defaultBusinessSlug: dto.default_business_slug,
        settings: dto.settings,
      },
      owner: {
        avatar_url: session.avatarUrl,
        email: session.email,
        full_name: session.fullName,
        identity: {
          provider: identity_provider.GOOGLE,
          providerAccountId: session.providerAccountId,
          providerEmail: session.email,
        },
        isVerified: true,
        password: null,
        phone: dto.owner.phone,
        username: dto.owner.username,
      },
    });

    const tokens = this.tokenService.generateTokenPair(
      {
        id: workspace.owner.id,
        tenant_id: workspace.owner.tenant_id,
        email: workspace.owner.email,
        role: workspace.owner.role,
        status: workspace.owner.status,
        username: workspace.owner.username,
      },
      'admin',
    );
    const owner = await this.prismaService.user.update({
      where: { id: workspace.owner.id },
      data: {
        refresh_token_hash: this.refreshTokenSessionService.hash(
          tokens.refresh_token,
        ),
      },
    });

    try {
      await this.onboardingSessionService.delete(token);
    } catch {
      this.logger.warn(
        'Google onboarding completed but session cleanup failed',
      );
    }

    return {
      ...workspace,
      ...tokens,
      locale: session.locale,
      owner,
      returnTo: session.returnTo,
    };
  }

  private async assertIdentityIsUnique(
    email: string,
    providerAccountId: string,
    username: string,
    phone?: string,
  ): Promise<void> {
    const [existingEmail, existingIdentity, existingUsername, existingPhone] =
      await Promise.all([
        this.usersService.findByEmail(email),
        this.prismaService.userIdentity.findUnique({
          where: {
            provider_provider_account_id: {
              provider: identity_provider.GOOGLE,
              provider_account_id: providerAccountId,
            },
          },
          select: { id: true },
        }),
        this.usersService.findByUsername(username),
        phone ? this.usersService.findByPhone(phone) : Promise.resolve(null),
      ]);

    if (existingEmail || existingIdentity) {
      throw new ConflictError(
        'Google account onboarding is already completed',
        'GOOGLE_ONBOARDING_ALREADY_COMPLETED',
      );
    }
    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }
    if (existingPhone) {
      throw new ConflictError('Phone number is already in use');
    }
  }
}
