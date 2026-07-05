import { Permissions } from '@/common/decorators/permissions.decorator';
import { BadRequestError, ForbiddenError } from '@/common/response';
import {
  ALL_PERMISSIONS,
  MANAGE_PERMISSION_SUFFIX,
} from '@/modules/permission/constants/permission.constants';
import { GetUserPermissionsUseCase } from '@/modules/permission/use-cases/get-user-permissions.use-case';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { user_role } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride(Permissions, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Express.Request>();
    const user = request.user;
    if (!user) {
      throw new ForbiddenError('User not found in request');
    }

    if (user.role === user_role.ADMIN) {
      return true;
    }

    const tenantId = request.tenant?.id;
    if (!tenantId) {
      throw new BadRequestError('Tenant context is required for permissions');
    }

    const userPermissions = await this.getUserPermissionsUseCase.execute(
      user.id,
      tenantId,
    );

    const canAccess = requiredPermissions.every((permission) =>
      this.hasPermission(userPermissions, permission),
    );

    if (!canAccess) {
      throw new ForbiddenError('Access denied');
    }

    return true;
  }

  private hasPermission(userPermissions: string[], required: string): boolean {
    if (userPermissions.includes(ALL_PERMISSIONS)) {
      return true;
    }

    if (userPermissions.includes(required)) {
      return true;
    }

    const [resource] = required.split(':');
    return userPermissions.includes(`${resource}${MANAGE_PERMISSION_SUFFIX}`);
  }
}
