import { NotFoundError } from '@/common/response';
import { toPermissionSummary } from '@/modules/permission/permission.mapper';
import { PermissionRepository } from '@/modules/permission/repository/permission.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListUserPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(userId: string, tenantId: string) {
    const user = await this.permissionRepository.findUserByIdInTenant(
      userId,
      tenantId,
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const userPermissions = await this.permissionRepository.findUserPermissions(
      userId,
      tenantId,
    );

    return {
      user_id: userId,
      tenant_id: tenantId,
      permissions: userPermissions.map(({ permission }) =>
        toPermissionSummary(permission),
      ),
    };
  }
}
