import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '@/common/response';
import { BcryptService } from '@/common/helpers/bcrypt.util';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AcceptInvitationDto } from '@/modules/auth/dto/accept-invitation.dto';
import { PermissionRepository } from '@/modules/permission/repository/permission.repository';
import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';

function hashToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function toPermissionKeys(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

@Injectable()
export class AcceptInvitationUseCase {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly bcryptService: BcryptService,
    private readonly permissionRepository: PermissionRepository,
  ) {}

  async execute(dto: AcceptInvitationDto) {
    const invitation = await this.prismaService.userInvitation.findUnique({
      where: { token_hash: hashToken(dto.token) },
    });

    if (!invitation) {
      throw new UnauthorizedError('Invalid invitation token');
    }

    if (invitation.accepted_at) {
      throw new BadRequestError('Invitation has already been accepted');
    }

    if (invitation.expires_at.getTime() <= Date.now()) {
      throw new BadRequestError('Invitation has expired');
    }

    const [existingEmail, existingUsername] = await Promise.all([
      this.prismaService.user.findUnique({
        where: { email: invitation.email },
      }),
      this.prismaService.user.findUnique({
        where: { username: dto.username },
      }),
    ]);

    if (existingEmail) {
      throw new ConflictError('An account with this email already exists');
    }

    if (existingUsername) {
      throw new ConflictError('Username is already taken');
    }

    const password = await this.bcryptService.hashPassword(dto.password);
    const permissionKeys = toPermissionKeys(invitation.permission_keys);
    const permissions =
      await this.permissionRepository.findPermissionsByKeys(permissionKeys);

    const user = await this.prismaService.user.create({
      data: {
        tenant_id: invitation.tenant_id,
        email: invitation.email,
        username: dto.username,
        full_name: dto.full_name,
        password,
        role: invitation.role,
        is_verified: true,
      },
    });

    if (permissions.length) {
      await this.permissionRepository.replaceUserPermissions(
        user.id,
        invitation.tenant_id,
        permissions.map((permission) => permission.id),
        invitation.invited_by_id ?? undefined,
      );
    }

    await this.prismaService.userInvitation.update({
      where: { id: invitation.id },
      data: { accepted_at: new Date() },
    });

    return {
      id: user.id,
      tenant_id: user.tenant_id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
    };
  }
}
