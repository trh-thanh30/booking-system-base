import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { normalizeHost, toTenantContext } from '@/modules/tenant/tenant.types';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { validate as isUuid } from 'uuid';

@Injectable()
export class TenantContextMiddleware implements NestMiddleware {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    try {
      const tenant = await this.resolveTenant(req);
      if (tenant) {
        req.tenant = tenant;
      }
    } catch {
      // TenantGuard will enforce context only on routes that opt in.
    }

    next();
  }

  private async resolveTenant(req: Request) {
    const tenantId = this.getHeader(req, 'x-tenant-id');

    if (tenantId && isUuid(tenantId)) {
      const tenant = await this.tenantRepository.findContextById(tenantId);
      return tenant ? toTenantContext(tenant) : undefined;
    }

    const host =
      this.getHeader(req, 'x-tenant-host') ??
      this.getHeader(req, 'host') ??
      undefined;

    if (!host) {
      return undefined;
    }

    const domain = await this.tenantRepository.findDomainByHost(
      normalizeHost(host),
    );

    return domain ? toTenantContext(domain.tenant) : undefined;
  }

  private getHeader(req: Request, name: string) {
    const value = req.headers[name];
    if (Array.isArray(value)) return value[0];
    return value;
  }
}
