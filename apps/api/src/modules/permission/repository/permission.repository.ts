import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAllPermissions() {
    return this.prisma.permission.findMany({
      orderBy: [{ resource: 'asc' }, { action: 'asc' }],
    });
  }

  findPermissionsByKeys(keys: string[]) {
    return this.prisma.permission.findMany({
      where: { key: { in: keys } },
    });
  }

  findUserByIdInTenant(userId: string, tenantId: string) {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        tenant_id: tenantId,
      },
      select: { id: true },
    });
  }

  findUserPermissionKeys(userId: string, tenantId: string) {
    return this.prisma.userPermission.findMany({
      where: {
        user_id: userId,
        tenant_id: tenantId,
      },
      include: {
        permission: {
          select: { key: true },
        },
      },
      orderBy: { permission: { key: 'asc' } },
    });
  }

  findUserPermissions(userId: string, tenantId: string) {
    return this.prisma.userPermission.findMany({
      where: {
        user_id: userId,
        tenant_id: tenantId,
      },
      include: {
        permission: true,
      },
      orderBy: { permission: { key: 'asc' } },
    });
  }

  async replaceUserPermissions(
    userId: string,
    tenantId: string,
    permissionIds: string[],
    grantedById?: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.userPermission.deleteMany({
        where: {
          user_id: userId,
          tenant_id: tenantId,
        },
      });

      if (permissionIds.length) {
        await tx.userPermission.createMany({
          data: permissionIds.map((permissionId) => ({
            user_id: userId,
            tenant_id: tenantId,
            permission_id: permissionId,
            granted_by_id: grantedById,
          })),
          skipDuplicates: true,
        });
      }

      return tx.userPermission.findMany({
        where: {
          user_id: userId,
          tenant_id: tenantId,
        },
        include: {
          permission: true,
        },
        orderBy: { permission: { key: 'asc' } },
      });
    });
  }

  async assignUserPermissions(
    userId: string,
    tenantId: string,
    permissionIds: string[],
    grantedById?: string,
  ) {
    if (!permissionIds.length) {
      return this.findUserPermissions(userId, tenantId);
    }

    await this.prisma.userPermission.createMany({
      data: permissionIds.map((permissionId) => ({
        user_id: userId,
        tenant_id: tenantId,
        permission_id: permissionId,
        granted_by_id: grantedById,
      })),
      skipDuplicates: true,
    });

    return this.findUserPermissions(userId, tenantId);
  }

  async revokeUserPermissions(
    userId: string,
    tenantId: string,
    permissionIds: string[],
  ) {
    await this.prisma.userPermission.deleteMany({
      where: {
        user_id: userId,
        tenant_id: tenantId,
        permission_id: { in: permissionIds },
      },
    });

    return this.findUserPermissions(userId, tenantId);
  }
}
