import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  findDomainByHost(host: string) {
    return this.prisma.tenantDomain.findUnique({
      where: { host },
      include: {
        tenant: {
          include: {
            domains: true,
            settings: true,
          },
        },
      },
    });
  }

  findContextById(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        domains: true,
        settings: true,
      },
    });
  }

  createTenant(data: Prisma.TenantCreateInput) {
    return this.prisma.tenant.create({ data });
  }
}
