import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TenantContext } from '@repo/shared';

export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ tenant?: TenantContext }>();
    return request.tenant;
  },
);
