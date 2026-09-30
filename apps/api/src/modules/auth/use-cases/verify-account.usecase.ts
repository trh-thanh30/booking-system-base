import { BadRequestError } from '@/common/response/client-errors/bad-request';
import { UnauthorizedError } from '@/common/response/client-errors/unauthorized';
import { PrismaService } from '@/database/prisma/prisma.service';
import { VerificationSessionService } from '@/modules/auth/services/verification-session.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { BaseUseCase } from '@/shared/interfaces/base-usecase.interface';
import { Injectable } from '@nestjs/common';

export interface VerifyAccountParams {
  sessionId: string;
  code: string;
}

@Injectable()
export class VerifyAccountUseCase implements BaseUseCase<
  VerifyAccountParams,
  void
> {
  constructor(
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly prismaService: PrismaService,
  ) {}

  async execute(params: VerifyAccountParams): Promise<void> {
    const { sessionId, code } = params;

    // Get email from session (sessionId is random, not email-based)
    const email = await this.verificationSessionService.getEmail(
      sessionId,
      'email_verification',
    );
    if (!email) {
      throw new UnauthorizedError('Invalid or expired verification session');
    }

    const isValid = await this.verificationService.verify({
      namespace: 'email_verification',
      subject: email,
      code,
    });

    if (!isValid) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    if (user.is_verified) {
      await this.verificationService.consume({
        namespace: 'email_verification',
        subject: email,
      });
      await this.verificationSessionService.deleteSession(
        sessionId,
        'email_verification',
      );
      return;
    }

    // Update user status to verified
    await this.prismaService.user.update({
      where: { email },
      data: { is_verified: true },
    });

    await this.verificationService.consume({
      namespace: 'email_verification',
      subject: email,
    });

    // Delete verification session after successful verification
    await this.verificationSessionService.deleteSession(
      sessionId,
      'email_verification',
    );
  }
}
