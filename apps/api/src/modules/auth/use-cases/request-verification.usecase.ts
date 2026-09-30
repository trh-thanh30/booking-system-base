import { RequestVerificationDto } from '@/modules/auth/dto/request-verification.dto';
import { VerificationSessionService } from '@/modules/auth/services/verification-session.service';
import { SendVerificationEmailUseCase } from '@/modules/email/use-cases/send-verification-email.usecase';
import { UsersService } from '@/modules/user/user.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

@Injectable()
export class RequestVerificationUseCase implements BaseUseCase<
  RequestVerificationDto,
  { sessionId: string }
> {
  constructor(
    private readonly usersService: UsersService,
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
  ) {}

  async execute(dto: RequestVerificationDto): Promise<{ sessionId: string }> {
    const email = dto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);
    const sessionId = await this.verificationSessionService.createSession(
      email,
      'email_verification',
    );

    // Keep the public response identical to prevent account enumeration.
    if (!user || user.is_verified) {
      return { sessionId };
    }

    try {
      await this.sendVerificationCode(email);
      return { sessionId };
    } catch (error) {
      await this.verificationSessionService.deleteSession(
        sessionId,
        'email_verification',
      );
      throw error;
    }
  }

  private async sendVerificationCode(email: string): Promise<void> {
    const { expiresAt, code } = await this.verificationService.generate({
      namespace: 'email_verification',
      subject: email,
      ttlSec: 15 * 60, // 15 minutes
      length: 6,
      maxAttempts: 5,
      rateLimitMax: 6,
      rateLimitWindowSec: 24 * 60 * 60, // 24 hours
    });

    const ttl = expiresAt - Date.now();

    await this.sendVerificationEmailUseCase.execute({
      to: email,
      code,
      ttl,
    });
  }
}
