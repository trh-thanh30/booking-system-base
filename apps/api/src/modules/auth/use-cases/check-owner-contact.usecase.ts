import { Injectable } from '@nestjs/common';
import { BadRequestError, UnauthorizedError } from '@/common/response';
import { UsersRepository } from '@/modules/user/repository/users.repository';
import {
  completeOwnerBusinessSchema,
  type OwnerContactAvailability,
} from '@repo/shared';
import { OwnerOnboardingSessionService } from '../services/owner-onboarding-session.service';
import { GoogleOnboardingSessionService } from '../services/google-onboarding-session.service';
import type { CheckOwnerContactDto } from '../dto/check-owner-contact.dto';

@Injectable()
export class CheckOwnerContactUseCase {
  constructor(
    private readonly users: UsersRepository,
    private readonly emailSessions: OwnerOnboardingSessionService,
    private readonly googleSessions: GoogleOnboardingSessionService,
  ) {}

  async execute(
    tokens: { emailToken?: string; googleToken?: string },
    input: CheckOwnerContactDto,
  ): Promise<OwnerContactAvailability> {
    const ownerId = tokens.googleToken
      ? (await this.googleSessions.get(tokens.googleToken)).userId
      : await this.emailSessions.get(tokens.emailToken ?? '');
    if (ownerId) {
      const owner = await this.users.findById(ownerId);
      if (
        !owner ||
        owner.role !== 'OWNER' ||
        owner.status !== 'ACTIVE' ||
        !owner.is_verified ||
        owner.tenant_id
      )
        throw new UnauthorizedError('Owner onboarding is not available');
    }
    const value = input.value.trim();
    const parsed =
      completeOwnerBusinessSchema.shape.owner.shape[input.field].safeParse(
        value,
      );
    if (!parsed.success || !value)
      throw new BadRequestError('Invalid contact field');
    const existing =
      input.field === 'username'
        ? await this.users.findByUsername(value)
        : await this.users.findByPhone(value);
    return {
      field: input.field,
      value,
      available: !existing || existing.id === ownerId,
    };
  }
}
