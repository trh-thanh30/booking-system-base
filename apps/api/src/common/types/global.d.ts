import { User } from '@prisma/client';
import type { TenantContext } from '@repo/shared';

declare global {
  namespace Express {
    export interface Request {
      requestId: string;
      session?: any;
      user?: User;
      guestId?: string;
      tenant?: TenantContext;
    }
  }
}

export {};
