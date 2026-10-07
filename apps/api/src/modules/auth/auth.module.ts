import { BcryptService } from '@/common/helpers/bcrypt.util';
import { cookieConfig, googleOAuthConfig } from '@/config';
import { PrismaService } from '@/database/prisma/prisma.service';
import { RedisModule } from '@/database/redis/redis.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { AdminAuthController } from '@/modules/auth/controllers/admin-auth.controller';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { GoogleAuthController } from '@/modules/auth/controllers/google-auth.controller';
import { PlatformAuthController } from '@/modules/auth/controllers/platform-auth.controller';
import { GoogleOAuthProvider } from '@/modules/auth/providers/google-oauth.provider';
import { AuthCookieService } from '@/modules/auth/services/auth-cookie.service';
import { AuthProfileService } from '@/modules/auth/services/auth-profile.service';
import { AuthTokenService } from '@/modules/auth/services/auth-token.service';
import { GoogleOnboardingSessionService } from '@/modules/auth/services/google-onboarding-session.service';
import { GoogleOAuthStateService } from '@/modules/auth/services/google-oauth-state.service';
import { VerificationSessionService } from '@/modules/auth/services/verification-session.service';
import { AcceptInvitationUseCase } from '@/modules/auth/use-cases/accept-invitation.usecase';
import { ChangePasswordUseCase } from '@/modules/auth/use-cases/change-password.usecase';
import { CompleteGoogleOwnerOnboardingUseCase } from '@/modules/auth/use-cases/complete-google-owner-onboarding.usecase';
import { CreateInvitationUseCase } from '@/modules/auth/use-cases/create-invitation.usecase';
import { ForgotPasswordUseCase } from '@/modules/auth/use-cases/forgot-password.usecase';
import { GetInvitationUseCase } from '@/modules/auth/use-cases/get-invitation.usecase';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { LoginWithGoogleUseCase } from '@/modules/auth/use-cases/login-with-google.usecase';
import { RefreshTokenSessionService } from '@/modules/auth/services/refresh-token-session.service';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';
import { RegisterOwnerUseCase } from '@/modules/auth/use-cases/register-owner.usecase';
import { TenantModule } from '@/modules/tenant/tenant.module';
import { RequestVerificationUseCase } from '@/modules/auth/use-cases/request-verification.usecase';
import { ResendVerificationUseCase } from '@/modules/auth/use-cases/resend-verification.usecase';
import { ResetPasswordUseCase } from '@/modules/auth/use-cases/reset-password.usecase';
import { StartGoogleLoginUseCase } from '@/modules/auth/use-cases/start-google-login.usecase';
import { VerifyAccountUseCase } from '@/modules/auth/use-cases/verify-account.usecase';
import { EmailModule } from '@/modules/email/email.module';
import { PermissionModule } from '@/modules/permission/permission.module';
import { UsersModule } from '@/modules/user/user.module';
import { VerificationModule } from '@/modules/verification/verification.module';
import { Module } from '@nestjs/common';
import { OwnerOnboardingController } from './controllers/owner-onboarding.controller';
import { OwnerOnboardingSessionService } from './services/owner-onboarding-session.service';
import { OwnerBusinessOnboardingUseCase } from './use-cases/owner-business-onboarding.usecase';
import { CheckOwnerBusinessSlugUseCase } from './use-cases/check-owner-business-slug.usecase';
import { RegisterOwnerAccountUseCase } from './use-cases/register-owner-account.usecase';
import { ConfigModule } from '@nestjs/config';
import { OwnerContactController } from './controllers/owner-contact.controller';
import { CheckOwnerContactUseCase } from './use-cases/check-owner-contact.usecase';

@Module({
  controllers: [
    OwnerContactController,
    AuthController,
    AdminAuthController,
    PlatformAuthController,
    GoogleAuthController,
    OwnerOnboardingController,
  ],
  providers: [
    CheckOwnerContactUseCase,
    RegisterOwnerUseCase,
    RegisterOwnerAccountUseCase,
    OwnerBusinessOnboardingUseCase,
    CheckOwnerBusinessSlugUseCase,
    OwnerOnboardingSessionService,
    LoginUserUseCase,
    StartGoogleLoginUseCase,
    LoginWithGoogleUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    RefreshTokenSessionService,
    RequestVerificationUseCase,
    CreateInvitationUseCase,
    GetInvitationUseCase,
    AcceptInvitationUseCase,
    PrismaService,
    AuthTokenService,
    VerificationSessionService,
    BcryptService,
    ChangePasswordUseCase,
    CompleteGoogleOwnerOnboardingUseCase,
    AuthCookieService,
    AuthProfileService,
    GoogleOnboardingSessionService,
    GoogleOAuthStateService,
    GoogleOAuthProvider,
  ],
  imports: [
    AssetsModule,
    UsersModule,
    PermissionModule,
    EmailModule,
    VerificationModule,
    TenantModule,
    RedisModule,
    ConfigModule.forFeature(cookieConfig),
    ConfigModule.forFeature(googleOAuthConfig),
  ],
  exports: [
    RegisterOwnerUseCase,
    LoginUserUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    AuthTokenService,
    VerificationSessionService,
    RefreshTokenUseCase,
    RequestVerificationUseCase,
  ],
})
export class AuthModule {}
