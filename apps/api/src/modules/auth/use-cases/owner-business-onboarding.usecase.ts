import { BcryptService } from '@/common/helpers/bcrypt.util';
import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '@/common/response';
import { UsersRepository } from '@/modules/user/repository/users.repository';
import { CreateTenantWorkspaceUseCase } from '@/modules/tenant/use-cases/create-tenant-workspace.use-case';
import { Injectable, Logger } from '@nestjs/common';
import { completeOwnerBusinessSchema } from '@repo/shared';
import { OwnerOnboardingSessionService } from '../services/owner-onboarding-session.service';
import { VerificationSessionService } from '../services/verification-session.service';
import {
  VerifyAccountUseCase,
  type VerifyAccountParams,
} from './verify-account.usecase';
import { LoginDto } from '../dto/login.dto';

@Injectable()
export class OwnerBusinessOnboardingUseCase {
  private readonly logger = new Logger(OwnerBusinessOnboardingUseCase.name);
  constructor(
    private readonly users: UsersRepository,
    private readonly sessions: OwnerOnboardingSessionService,
    private readonly verificationSessions: VerificationSessionService,
    private readonly verifyAccount: VerifyAccountUseCase,
    private readonly bcrypt: BcryptService,
    private readonly workspace: CreateTenantWorkspaceUseCase,
  ) {}

  async verify(input: VerifyAccountParams): Promise<string | null> {
    const email = await this.verificationSessions.getEmail(
      input.sessionId,
      'email_verification',
    );
    await this.verifyAccount.execute(input);
    const user = email ? await this.users.findByEmail(email) : null;
    if (!user || user.role !== 'OWNER' || user.tenant_id) return null;
    this.assertPending(user);
    return this.sessions.create(user.id);
  }

  async resume(input: LoginDto) {
    const identifier = input.usernameOrEmail.trim();
    const user = await this.users.findByEmailOrUsername(
      identifier.includes('@') ? identifier.toLowerCase() : identifier,
    );
    if (
      !user?.password ||
      !(await this.bcrypt.comparePassword(input.password, user.password))
    )
      throw new UnauthorizedError('Invalid credentials');
    this.assertPending(user);
    return this.sessions.create(user.id);
  }

  async profile(token: string) {
    const user = await this.pendingUser(token);
    return {
      email: user.email,
      full_name: user.full_name,
      avatar_url: user.avatar_url,
    };
  }

  async execute(token: string, input: unknown) {
    const user = await this.pendingUser(token);
    const parsed = completeOwnerBusinessSchema.safeParse(input);
    if (!parsed.success)
      throw new BadRequestError(
        'Invalid business information',
        'OWNER_ONBOARDING_INPUT_INVALID',
      );
    const dto = parsed.data;
    const [username, phone] = await Promise.all([
      this.users.findByUsername(dto.owner.username),
      dto.owner.phone
        ? this.users.findByPhone(dto.owner.phone)
        : Promise.resolve(null),
    ]);
    if (username && username.id !== user.id)
      throw new ConflictError('Username is already taken');
    if (phone && phone.id !== user.id)
      throw new ConflictError('Phone number is already in use');
    const result = await this.workspace.execute({
      tenant: {
        name: dto.name,
        slug: dto.slug,
        timezone: dto.timezone,
        locale: dto.locale,
        businessCategoryId: dto.business_category_id,
        defaultBusinessSettings: { onboarding: dto.business_profile },
      },
      owner: {
        existingUserId: user.id,
        email: user.email,
        username: dto.owner.username,
        password: user.password,
        isVerified: true,
        phone: dto.owner.phone,
      },
    });
    try {
      await this.sessions.delete(token);
    } catch {
      this.logger.warn('Owner onboarding completed; ticket cleanup failed');
    }
    return result;
  }

  private async pendingUser(token: string) {
    const user = await this.users.findById(await this.sessions.get(token));
    this.assertPending(user);
    return user;
  }
  private assertPending(
    user: Awaited<ReturnType<UsersRepository['findById']>>,
  ): asserts user is NonNullable<typeof user> {
    if (
      !user ||
      user.role !== 'OWNER' ||
      user.status !== 'ACTIVE' ||
      !user.is_verified ||
      user.tenant_id
    )
      throw new UnauthorizedError(
        'Owner onboarding is not available',
        'OWNER_ONBOARDING_SESSION_INVALID',
      );
  }
}
