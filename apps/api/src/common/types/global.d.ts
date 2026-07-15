import { User } from '@prisma/client';
import type { BusinessContext } from '@repo/shared';
import type { TenantContext } from '@/common/types/tenant-context.types';

declare global {
  namespace Express {
    export interface Request {
      requestId: string;
      session?: any;
      user?: User;
      guestId?: string;
      tenant?: TenantContext;
      business?: BusinessContext;
    }
  }
}

export {};
