import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { BusinessContext } from '@repo/shared';

export const Business = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): BusinessContext | undefined => {
    const request = ctx
      .switchToHttp()
      .getRequest<{ business?: BusinessContext }>();
    return request.business;
  },
);
