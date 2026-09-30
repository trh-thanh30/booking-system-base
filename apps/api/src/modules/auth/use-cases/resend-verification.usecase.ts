import { BadRequestError } from '@/common/response/client-errors/bad-request';
import { NotFoundError } from '@/common/response/client-errors/not-found';
import { UnauthorizedError } from '@/common/response/client-errors/unauthorized';
import { ResendVerificationDto } from '@/modules/auth/dto/resend-verification.dto';
import { VerificationSessionService } from '@/modules/auth/services/verification-session.service';
import { SendVerificationEmailUseCase } from '@/modules/email/use-cases/send-verification-email.usecase';
import { UsersService } from '@/modules/user/user.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResendVerificationUseCase implements BaseUseCase<
  ResendVerificationDto,
  void
> {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
  ) {}

  async execute(dto: ResendVerificationDto): Promise<void> {
    // Get email from session
    const email = await this.verificationSessionService.getEmail(
      dto.sessionId,
      'email_verification',
    );
    if (!email) {
      throw new UnauthorizedError('Invalid or expired verification session');
    }

    // Find user by email
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Check if user is already verified
    if (user.is_verified) {
      // Clean up session
      await this.verificationSessionService.deleteSession(
        dto.sessionId,
        'email_verification',
      );
      throw new BadRequestError('Account is already verified');
    }

    // Generate new verification code with rate limit (6 times per day)
    const { expiresAt, code } = await this.verificationService.generate({
      namespace: 'email_verification',
      subject: email,
      ttlSec: 15 * 60, // 15 minutes
      length: 6,
      maxAttempts: 5,
      rateLimitMax: 6, // 6 times per day
      rateLimitWindowSec: 24 * 60 * 60, // 24 hours
    });

    const ttl = expiresAt - Date.now(); // in milliseconds

    // Send verification email
    await this.sendVerificationEmailUseCase.execute({
      to: email,
      code,
      ttl,
    });

    // Extend session TTL
    await this.verificationSessionService.extendSession(
      dto.sessionId,
      'email_verification',
    );
  }
}
