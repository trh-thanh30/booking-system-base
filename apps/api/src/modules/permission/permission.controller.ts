import {
  ApiSuccess,
  Permissions,
  RequireTenant,
  Tenant,
} from '@/common/decorators';
import type { TenantContext } from '@/common/types/tenant-context.types';
import { PERMISSIONS } from '@/modules/permission/constants/permission.constants';
import { UserPermissionsDto } from '@/modules/permission/dto/user-permissions.dto';
import { AssignUserPermissionsUseCase } from '@/modules/permission/use-cases/assign-user-permissions.use-case';
import { ListPermissionsUseCase } from '@/modules/permission/use-cases/list-permissions.use-case';
import { ListUserPermissionsUseCase } from '@/modules/permission/use-cases/list-user-permissions.use-case';
import { ReplaceUserPermissionsUseCase } from '@/modules/permission/use-cases/replace-user-permissions.use-case';
import { RevokeUserPermissionsUseCase } from '@/modules/permission/use-cases/revoke-user-permissions.use-case';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';

type AuthenticatedRequest = Request & {
  user?: {
    id: string;
  };
};

@RequireTenant()
@Controller()
export class PermissionController {
  constructor(
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
    private readonly listUserPermissionsUseCase: ListUserPermissionsUseCase,
    private readonly assignUserPermissionsUseCase: AssignUserPermissionsUseCase,
    private readonly replaceUserPermissionsUseCase: ReplaceUserPermissionsUseCase,
    private readonly revokeUserPermissionsUseCase: RevokeUserPermissionsUseCase,
  ) {}

  @Get('permissions')
  @Permissions([PERMISSIONS.PERMISSION.READ])
  @ApiSuccess('Permissions retrieved successfully')
  listPermissions() {
    return this.listPermissionsUseCase.execute();
  }

  @Get('permissions/resources')
  @Permissions([PERMISSIONS.PERMISSION.READ])
  @ApiSuccess('Permission resources retrieved successfully')
  listPermissionResources() {
    return this.listPermissionsUseCase.groupedByResource();
  }

  @Get('users/:userId/permissions')
  @Permissions([PERMISSIONS.PERMISSION.MANAGE])
  @ApiSuccess('User permissions retrieved successfully')
  listUserPermissions(
    @Tenant() tenant: TenantContext,
    @Param('userId') userId: string,
  ) {
    return this.listUserPermissionsUseCase.execute(userId, tenant.id);
  }

  @Post('users/:userId/permissions')
  @Permissions([PERMISSIONS.PERMISSION.MANAGE])
  @ApiSuccess('User permissions assigned successfully')
  assignUserPermissions(
    @Tenant() tenant: TenantContext,
    @Param('userId') userId: string,
    @Body() dto: UserPermissionsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.assignUserPermissionsUseCase.execute(
      userId,
      tenant.id,
      dto,
      request.user?.id,
    );
  }

  @Put('users/:userId/permissions')
  @Permissions([PERMISSIONS.PERMISSION.MANAGE])
  @ApiSuccess('User permissions replaced successfully')
  replaceUserPermissions(
    @Tenant() tenant: TenantContext,
    @Param('userId') userId: string,
    @Body() dto: UserPermissionsDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.replaceUserPermissionsUseCase.execute(
      userId,
      tenant.id,
      dto,
      request.user?.id,
    );
  }

  @Delete('users/:userId/permissions')
  @Permissions([PERMISSIONS.PERMISSION.MANAGE])
  @ApiSuccess('User permissions revoked successfully')
  revokeUserPermissions(
    @Tenant() tenant: TenantContext,
    @Param('userId') userId: string,
    @Body() dto: UserPermissionsDto,
  ) {
    return this.revokeUserPermissionsUseCase.execute(userId, tenant.id, dto);
  }
}
