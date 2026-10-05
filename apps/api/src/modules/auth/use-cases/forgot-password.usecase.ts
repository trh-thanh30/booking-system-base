import { ForgotPasswordDto } from '@/modules/auth/dto/forgot-password.dto';
import { VerificationSessionService } from '@/modules/auth/services/verification-session.service';
import { SendForgotPasswordEmailUseCase } from '@/modules/email/use-cases/send-forgot-password-email.usecase';
import { UsersService } from '@/modules/user/user.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ForgotPasswordUseCase implements BaseUseCase<
  ForgotPasswordDto,
  string
> {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly sendForgotPasswordEmailUseCase: SendForgotPasswordEmailUseCase,
  ) {}

  async execute(dto: ForgotPasswordDto): Promise<string> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    const sessionId = await this.verificationSessionService.createSession(
      email,
      'password_reset',
    );

    try {
      // Apply the same quota and response for every email, including missing accounts.
      const { expiresAt, code } = await this.verificationService.generate({
        namespace: 'password_reset',
        subject: email,
        ttlSec: 15 * 60, // 15 minutes
        length: 6,
        maxAttempts: 5,
        rateLimitMax: 3,
        rateLimitWindowSec: 60 * 15, // 15 minutes
      });
      if (!user) return sessionId;
      const ttl = new Date(expiresAt);

      // Send forgot password email asynchronously
      await this.sendForgotPasswordEmailUseCase.execute({
        to: email,
        code,
        ttl,
      });

      return sessionId;
    } catch (error) {
      await this.verificationSessionService.deleteSession(
        sessionId,
        'password_reset',
      );
      throw error;
    }
  }
}
