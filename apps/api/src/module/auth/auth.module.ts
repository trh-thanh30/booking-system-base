import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { cookieConfig } from '@/config';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsModule } from '@/module/assets/assets.module';
import { RedisModule } from '@/database/redis/redis.module';
import { ChangePasswordUseCase } from '@/module/auth/use-cases/change-password.usecase';
import { ForgotPasswordUseCase } from '@/module/auth/use-cases/forgot-password.usecase';
import { RefreshTokenUseCase } from '@/module/auth/use-cases/refresh-token.usecase';
import { ResetPasswordUseCase } from '@/module/auth/use-cases/reset-password.usecase';
import { BcryptService } from '@/common/helpers/bcrypt.util';
import { CodeService } from '@/common/helpers/code.util';
import { EmailModule } from '@/module/email/email.module';
import { UsersModule } from '@/module/user/user.module';
import { VerificationModule } from '@/module/verification/verification.module';
import { AuthController } from '@/module/auth/auth.controller';
import { AuthTokenService } from '@/module/auth/service/auth-token.service';
import { VerificationSessionService } from '@/module/auth/service/verification-session.service';
import { LoginUserUseCase } from '@/module/auth/use-cases/login-user.usecase';
import { RegisterUserUseCase } from '@/module/auth/use-cases/register-user.usecase';
import { RequestVerificationUseCase } from '@/module/auth/use-cases/request-verification.usecase';
import { ResendVerificationUseCase } from '@/module/auth/use-cases/resend-verification.usecase';
import { VerifyAccountUseCase } from '@/module/auth/use-cases/verify-account.usecase';

@Module({
  controllers: [AuthController],
  providers: [
    RegisterUserUseCase,
    LoginUserUseCase,
    VerifyAccountUseCase,
    ResendVerificationUseCase,
    ForgotPasswordUseCase,
    ResetPasswordUseCase,
    RefreshTokenUseCase,
    RequestVerificationUseCase,
    PrismaService,
    CodeService,
    AuthTokenService,
    VerificationSessionService,
    BcryptService,
    ChangePasswordUseCase,
  ],
  imports: [
    AssetsModule,
    UsersModule,
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
