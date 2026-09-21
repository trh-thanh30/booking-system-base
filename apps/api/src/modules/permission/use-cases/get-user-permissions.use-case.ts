import { PermissionRepository } from '@/modules/permission/repository/permission.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetUserPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(userId: string, tenantId: string): Promise<string[]> {
    const permissions = await this.permissionRepository.findUserPermissionKeys(
      userId,
      tenantId,
    );

    return permissions.map(({ permission }) => permission.key);
  }
}
