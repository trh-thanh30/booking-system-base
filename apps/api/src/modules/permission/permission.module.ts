import { PermissionController } from '@/modules/permission/permission.controller';
import { PermissionRepository } from '@/modules/permission/repository/permission.repository';
import { AssignUserPermissionsUseCase } from '@/modules/permission/use-cases/assign-user-permissions.use-case';
import { GetUserPermissionsUseCase } from '@/modules/permission/use-cases/get-user-permissions.use-case';
import { ListUserPermissionsUseCase } from '@/modules/permission/use-cases/list-user-permissions.use-case';
import { ListPermissionsUseCase } from '@/modules/permission/use-cases/list-permissions.use-case';
import { ReplaceUserPermissionsUseCase } from '@/modules/permission/use-cases/replace-user-permissions.use-case';
import { RevokeUserPermissionsUseCase } from '@/modules/permission/use-cases/revoke-user-permissions.use-case';
import { Module } from '@nestjs/common';

@Module({
  controllers: [PermissionController],
  providers: [
    PermissionRepository,
    ListPermissionsUseCase,
    GetUserPermissionsUseCase,
    ListUserPermissionsUseCase,
    AssignUserPermissionsUseCase,
    ReplaceUserPermissionsUseCase,
    RevokeUserPermissionsUseCase,
  ],
  exports: [PermissionRepository, GetUserPermissionsUseCase],
})
export class PermissionModule {}
