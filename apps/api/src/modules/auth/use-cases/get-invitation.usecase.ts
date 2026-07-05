import { NotFoundError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class GetInvitationUseCase {
  constructor(private readonly prismaService: PrismaService) {}

  async execute(token: string) {
    const invitation = await this.prismaService.userInvitation.findUnique({
      where: { token_hash: hashToken(token) },
      include: {
        tenant: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundError('Invitation not found');
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      tenant: invitation.tenant,
      accepted_at: invitation.accepted_at,
      expires_at: invitation.expires_at,
      is_expired: invitation.expires_at.getTime() <= Date.now(),
    };
  }
}
