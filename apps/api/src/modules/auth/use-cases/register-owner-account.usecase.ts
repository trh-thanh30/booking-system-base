import { BcryptService } from '@/common/helpers/bcrypt.util';
import { BadRequestError, ConflictError } from '@/common/response';
import { UsersRepository } from '@/modules/user/repository/users.repository';
import { VerificationSessionService } from '../services/verification-session.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { SendVerificationEmailUseCase } from '@/modules/email/use-cases/send-verification-email.usecase';
import { Injectable, Logger } from '@nestjs/common';
import {
  registerOwnerAccountSchema,
  type RegisterOwnerAccountInput,
} from '@repo/shared';
import { randomUUID } from 'node:crypto';

@Injectable()
export class RegisterOwnerAccountUseCase {
  private readonly logger = new Logger(RegisterOwnerAccountUseCase.name);
  constructor(
    private readonly users: UsersRepository,
    private readonly bcrypt: BcryptService,
    private readonly sessions: VerificationSessionService,
    private readonly verification: VerificationService,
    private readonly email: SendVerificationEmailUseCase,
  ) {}

  async execute(input: RegisterOwnerAccountInput) {
    const parsed = registerOwnerAccountSchema.safeParse(input);
    if (!parsed.success)
      throw new BadRequestError('Invalid registration input');
    const { email, password } = parsed.data;
    if (await this.users.findByEmail(email))
      throw new ConflictError('An account with this email already exists');
    const hash = await this.bcrypt.hashPassword(password);
    try {
      await this.users.createUnchecked({
        email,
        username: `owner_${randomUUID()}`,
        password: hash,
        tenant_id: null,
        role: 'OWNER',
        status: 'ACTIVE',
        is_verified: false,
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      )
        throw new ConflictError('An account with this email already exists');
      throw error;
    }
    const sessionId = await this.sessions.createSession(
      email,
      'email_verification',
    );
    try {
      const { code, expiresAt } = await this.verification.generate({
        namespace: 'email_verification',
        subject: email,
        ttlSec: 900,
        length: 6,
        maxAttempts: 5,
        rateLimitMax: 3,
        rateLimitWindowSec: 900,
      });
      await this.email.execute({
        to: email,
        code,
        ttl: expiresAt - Date.now(),
      });
    } catch {
      this.logger.warn(
        'Owner account persisted; verification email must be retried',
      );
    }
    return { sessionId };
  }
}
