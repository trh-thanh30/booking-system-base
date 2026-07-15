import { PermissionRepository } from '@/modules/permission/repository/permission.repository';
import { groupPermissionsByResource } from '@/modules/permission/permission.mapper';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute() {
    const permissions = await this.permissionRepository.findAllPermissions();
    return permissions.map((permission) => ({
      id: permission.id,
      key: permission.key,
      resource: permission.resource,
      action: permission.action,
      description: permission.description,
    }));
  }

  async groupedByResource() {
    const permissions = await this.permissionRepository.findAllPermissions();
    return groupPermissionsByResource(permissions);
  }
}
