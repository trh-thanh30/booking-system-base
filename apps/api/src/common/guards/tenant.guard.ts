import { REQUIRE_TENANT_KEY } from '@/common/decorators/require-tenant.decorator';
import { ForbiddenError, BadRequestError } from '@/common/response';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tenant_status, user_role } from '@prisma/client';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requireTenant = this.reflector.getAllAndOverride<boolean>(
      REQUIRE_TENANT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requireTenant) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Express.Request>();
    const tenant = request.tenant;

    if (!tenant) {
      throw new BadRequestError('Tenant context is required');
    }

    const user = request.user;
    const authContext =
      user && 'auth_context' in user ? user.auth_context : undefined;
    const isBusinessAdmin =
      authContext === 'admin' &&
      (user?.role === user_role.OWNER || user?.role === user_role.STAFF);
    if (!isBusinessAdmin || !user?.tenant_id || user.tenant_id !== tenant.id) {
      throw new ForbiddenError('Tenant is not accessible');
    }

    if (tenant.status !== tenant_status.ACTIVE) {
      throw new ForbiddenError('Tenant is not active');
    }

    return true;
  }
}
