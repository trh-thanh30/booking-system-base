import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TenantContext } from '@/common/types/tenant-context.types';

export const Tenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantContext | undefined => {
    const request = ctx.switchToHttp().getRequest<{ tenant?: TenantContext }>();
    return request.tenant;
  },
);
