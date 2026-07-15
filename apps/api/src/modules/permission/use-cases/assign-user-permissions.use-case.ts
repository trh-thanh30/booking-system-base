import { BadRequestError, NotFoundError } from '@/common/response';
import { UserPermissionsDto } from '@/modules/permission/dto/user-permissions.dto';
import { toPermissionSummary } from '@/modules/permission/permission.mapper';
import { PermissionRepository } from '@/modules/permission/repository/permission.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AssignUserPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(
    userId: string,
    tenantId: string,
    dto: UserPermissionsDto,
    grantedById?: string,
  ) {
    const user = await this.permissionRepository.findUserByIdInTenant(
      userId,
      tenantId,
    );

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const permissions = await this.permissionRepository.findPermissionsByKeys(
      dto.permission_keys,
    );

    if (permissions.length !== new Set(dto.permission_keys).size) {
      throw new BadRequestError('One or more permissions are invalid');
    }

    const userPermissions =
      await this.permissionRepository.assignUserPermissions(
        userId,
        tenantId,
        permissions.map((permission) => permission.id),
        grantedById,
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
