import { ConflictError, BadRequestError } from '@/common/response';
import { PrismaService } from '@/database/prisma/prisma.service';
import { CreateInvitationDto } from '@/modules/auth/dto/create-invitation.dto';
import { PermissionRepository } from '@/modules/permission/repository/permission.repository';
import { Injectable } from '@nestjs/common';
import { user_role } from '@prisma/client';
import { createHash, randomBytes } from 'node:crypto';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

@Injectable()
export class CreateInvitationUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(
    tenantId: string,
    invitedById: string | undefined,
    dto: CreateInvitationDto,
  ) {
    const existingUser = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictError('An account with this email already exists');
    }

    if (dto.role && ![user_role.OWNER, user_role.STAFF].includes(dto.role)) {
      throw new BadRequestError('Only OWNER or STAFF can be invited');
    }

    const permissionKeys = Array.from(new Set(dto.permission_keys ?? []));
    const permissions =
      await this.permissionRepository.findPermissionsByKeys(permissionKeys);

    if (permissions.length !== permissionKeys.length) {
      throw new BadRequestError('One or more permissions are invalid');
    }

    const token = randomBytes(32).toString('hex');
    const invitation = await this.prismaService.userInvitation.create({
      data: {
        tenant_id: tenantId,
        email: dto.email,
        role: dto.role ?? user_role.STAFF,
        permission_keys: permissionKeys,
        token_hash: hashToken(token),
        invited_by_id: invitedById,
        expires_at: new Date(Date.now() + INVITATION_TTL_MS),
      },
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

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      permission_keys: permissionKeys,
      tenant: invitation.tenant,
      token,
      expires_at: invitation.expires_at,
      created_at: invitation.created_at,
    };
  }
}
