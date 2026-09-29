import { BcryptService } from '@/common/helpers/bcrypt.util';
import { CodeService } from '@/common/helpers/code.util';
import { cookieConfig } from '@/config';
import { PrismaService } from '@/database/prisma/prisma.service';
import { RedisModule } from '@/database/redis/redis.module';
import { AssetsModule } from '@/modules/assets/assets.module';
import { AdminAuthController } from '@/modules/auth/controllers/admin-auth.controller';
import { AuthController } from '@/modules/auth/controllers/auth.controller';
import { PlatformAuthController } from '@/modules/auth/controllers/platform-auth.controller';
import { AuthCookieService } from '@/modules/auth/services/auth-cookie.service';
import { AuthProfileService } from '@/modules/auth/services/auth-profile.service';
import { AuthTokenService } from '@/modules/auth/services/auth-token.service';
import { VerificationSessionService } from '@/modules/auth/services/verification-session.service';
import { AcceptInvitationUseCase } from '@/modules/auth/use-cases/accept-invitation.usecase';
import { ChangePasswordUseCase } from '@/modules/auth/use-cases/change-password.usecase';
import { CreateInvitationUseCase } from '@/modules/auth/use-cases/create-invitation.usecase';
import { ForgotPasswordUseCase } from '@/modules/auth/use-cases/forgot-password.usecase';
import { GetInvitationUseCase } from '@/modules/auth/use-cases/get-invitation.usecase';
import { LoginUserUseCase } from '@/modules/auth/use-cases/login-user.usecase';
import { RefreshTokenUseCase } from '@/modules/auth/use-cases/refresh-token.usecase';
import { RegisterUserUseCase } from '@/modules/auth/use-cases/register-user.usecase';
import { RequestVerificationUseCase } from '@/modules/auth/use-cases/request-verification.usecase';
import { ResendVerificationUseCase } from '@/modules/auth/use-cases/resend-verification.usecase';
import { ResetPasswordUseCase } from '@/modules/auth/use-cases/reset-password.usecase';
import { VerifyAccountUseCase } from '@/modules/auth/use-cases/verify-account.usecase';
import { EmailModule } from '@/modules/email/email.module';
import { PermissionModule } from '@/modules/permission/permission.module';
import { UsersModule } from '@/modules/user/user.module';
import { VerificationModule } from '@/modules/verification/verification.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [AuthController, AdminAuthController, PlatformAuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    RequestVerificationUseCase,
    CreateInvitationUseCase,
    GetInvitationUseCase,
    AcceptInvitationUseCase,
    PrismaService,
    CodeService,
    AuthTokenService,
    VerificationSessionService,
    BcryptService,
    ChangePasswordUseCase,
    AuthCookieService,
    AuthProfileService,
  ],
  imports: [
    AssetsModule,
    UsersModule,
    PermissionModule,
    EmailModule,
    VerificationModule,
    RedisModule,
    ConfigModule.forFeature(cookieConfig),
  ],
  exports: [
    RegisterUserUseCase,
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
