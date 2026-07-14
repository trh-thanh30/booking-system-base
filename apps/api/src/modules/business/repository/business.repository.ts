import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

@Injectable()
export class BusinessRepository {
  constructor(private readonly prisma: PrismaService) {}

  findBySlugInTenant(tenantId: string, slug: string) {
    return this.prisma.business.findUnique({
      where: {
        tenant_id_slug: {
          tenant_id: tenantId,
          slug,
        },
      },
    });
  }

  listByTenant(tenantId: string) {
    return this.prisma.business.findMany({
      where: { tenant_id: tenantId },
      orderBy: [{ is_default: 'desc' }, { created_at: 'asc' }],
    });
  }

  listForUser(
    userId: string,
    tenantId: string,
    includeAllTenantBusinesses: boolean,
  ) {
    if (includeAllTenantBusinesses) {
      return this.listByTenant(tenantId);
    }

    return this.prisma.business.findMany({
      where: {
        tenant_id: tenantId,
        memberships: {
          some: {
            user_id: userId,
          },
        },
      },
      orderBy: [{ is_default: 'desc' }, { created_at: 'asc' }],
    });
  }

  create(data: Prisma.BusinessUncheckedCreateInput) {
    return this.prisma.business.create({ data });
  }
}
