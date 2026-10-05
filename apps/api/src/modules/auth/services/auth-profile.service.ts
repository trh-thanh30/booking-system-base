import { NotFoundError } from '@/common/response';
import { toBusinessSummary } from '@/modules/business/business.types';
import { ALL_PERMISSIONS } from '@/modules/permission/constants/permission.constants';
import { GetUserPermissionsUseCase } from '@/modules/permission/use-cases/get-user-permissions.use-case';
import { UsersService } from '@/modules/user/user.service';
import { Injectable } from '@nestjs/common';
import { user_role } from '@prisma/client';

@Injectable()
export class AuthProfileService {
  constructor(
    private readonly usersService: UsersService,
    private readonly getUserPermissionsUseCase: GetUserPermissionsUseCase,
  ) {}

  async getByUserId(userId: string) {
    const user = await this.usersService.findAuthProfileById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const isPlatformUser = user.role === user_role.SUPER_ADMIN;

    return {
      id: user.id,
      tenant_id: isPlatformUser ? null : user.tenant_id,
      email: user.email,
      username: user.username,
      full_name: user.full_name,
      phone: user.phone,
      avatar_url: user.avatar_url,
      role: user.role,
      status: user.status,
      is_verified: user.is_verified,
      tenant:
        !isPlatformUser && user.tenant
          ? {
              id: user.tenant.id,
              slug: user.tenant.slug,
              name: user.tenant.name,
              status: user.tenant.status,
              timezone: user.tenant.timezone,
              locale: user.tenant.locale,
            }
          : null,
      businesses: this.resolveAuthBusinesses(user),
      permissions: await this.resolveUserPermissions(
        user.id,
        user.tenant_id,
        user.role,
      ),
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }

  private async resolveUserPermissions(
    userId: string,
    tenantId: string | null,
    role: user_role,
  ) {
    if (role === user_role.SUPER_ADMIN || role === user_role.OWNER) {
      return [ALL_PERMISSIONS];
    }

    if (!tenantId) {
      return [];
    }

    return this.getUserPermissionsUseCase.execute(userId, tenantId);
  }

  private resolveAuthBusinesses(
    user: NonNullable<Awaited<ReturnType<UsersService['findAuthProfileById']>>>,
  ) {
    if (user.role === user_role.SUPER_ADMIN || !user.tenant_id) {
      return [];
    }

    if (user.role === user_role.OWNER) {
      return (user.tenant?.businesses ?? []).map(toBusinessSummary);
    }

    return user.business_memberships
      .filter(
        (membership) =>
          membership.tenant_id === user.tenant_id &&
          membership.business.tenant_id === user.tenant_id,
      )
      .map((membership) => membership.business)
      .map(toBusinessSummary);
  }
}
