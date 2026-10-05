import { BcryptService } from '@/common/helpers/bcrypt.util';
import { BadRequestError, ConflictError } from '@/common/response';
import { RegisterOwnerDto } from '@/modules/auth/dto/register-owner.dto';
import { VerificationSessionService } from '@/modules/auth/services/verification-session.service';
import { SendVerificationEmailUseCase } from '@/modules/email/use-cases/send-verification-email.usecase';
import { CreateTenantWorkspaceUseCase } from '@/modules/tenant/use-cases/create-tenant-workspace.use-case';
import { UsersService } from '@/modules/user/user.service';
import { VerificationService } from '@/modules/verification/verification.service';
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class RegisterOwnerUseCase {
  private readonly logger = new Logger(RegisterOwnerUseCase.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly bcryptService: BcryptService,
    private readonly createTenantWorkspaceUseCase: CreateTenantWorkspaceUseCase,
    private readonly verificationService: VerificationService,
    private readonly verificationSessionService: VerificationSessionService,
    private readonly sendVerificationEmailUseCase: SendVerificationEmailUseCase,
  ) {}

  async execute(dto: RegisterOwnerDto) {
    if (dto.owner.password !== dto.owner.confirmPassword) {
      throw new BadRequestError('Confirm password does not match');
    }

    const email = dto.owner.email.trim().toLowerCase();
    await this.assertOwnerIdentityIsUnique(
      email,
      dto.owner.username,
      dto.owner.phone,
    );

    const hashedPassword = await this.bcryptService.hashPassword(
      dto.owner.password,
    );
    const sessionId = await this.verificationSessionService.createSession(
      email,
      'email_verification',
    );

    let workspace: Awaited<ReturnType<CreateTenantWorkspaceUseCase['execute']>>;
    try {
      workspace = await this.createTenantWorkspaceUseCase.execute({
        tenant: {
          slug: dto.slug,
          name: dto.name,
          timezone: dto.timezone,
          locale: dto.locale,
          primaryDomain: dto.primary_domain,
          defaultBusinessName: dto.default_business_name,
          defaultBusinessSlug: dto.default_business_slug,
          settings: dto.settings,
        },
        owner: {
          email,
          username: dto.owner.username,
          password: hashedPassword,
          full_name: dto.owner.full_name,
          phone: dto.owner.phone,
        },
      });
    } catch (error) {
      await this.verificationSessionService.deleteSession(
        sessionId,
        'email_verification',
      );
      throw error;
    }

    await this.sendVerificationEmail(email);

    return { ...workspace, sessionId };
  }

  private async assertOwnerIdentityIsUnique(
    email: string,
    username: string,
    phone?: string,
  ): Promise<void> {
    const [existingEmail, existingUsername, existingPhone] = await Promise.all([
      this.usersService.findByEmail(email),
      this.usersService.findByUsername(username),
      phone ? this.usersService.findByPhone(phone) : Promise.resolve(null),
    ]);

    if (existingEmail) {
      throw new ConflictError('An account with this email already exists');
    }
    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }
    if (existingPhone) {
      throw new ConflictError('Phone number is already in use');
    }
  }

  private async sendVerificationEmail(email: string): Promise<void> {
    try {
      const { code, expiresAt } = await this.verificationService.generate({
        namespace: 'email_verification',
        subject: email,
        ttlSec: 15 * 60,
        length: 6,
        maxAttempts: 5,
        rateLimitMax: 3,
        rateLimitWindowSec: 15 * 60,
      });

      await this.sendVerificationEmailUseCase.execute({
        to: email,
        code,
        ttl: expiresAt - Date.now(),
      });
    } catch {
      this.logger.warn(
        'Workspace created but verification email was not queued',
      );
    }
  }
}
