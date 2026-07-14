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

  findAccessibleById(
    businessId: string,
    tenantId: string,
    userId: string,
    includeAllTenantBusinesses: boolean,
  ) {
    return this.prisma.business.findFirst({
      where: {
        id: businessId,
        tenant_id: tenantId,
        ...(includeAllTenantBusinesses
          ? {}
          : {
              memberships: {
                some: {
                  user_id: userId,
                },
              },
            }),
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
