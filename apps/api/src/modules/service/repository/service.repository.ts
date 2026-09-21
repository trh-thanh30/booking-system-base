import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma, service_status } from '@prisma/client';

export type ListServicesParams = {
  tenantId: string;
  businessId: string;
  search?: string;
  categoryId?: string | null;
  status?: service_status;
  includeArchived?: boolean;
  page: number;
  limit: number;
};

@Injectable()
export class ServiceRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: ListServicesParams) {
    const where = this.toListWhere(params);
    const skip = (params.page - 1) * params.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.service.findMany({
        where,
        include: { category: true },
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }, { id: 'asc' }],
        skip,
        take: params.limit,
      }),
      this.prisma.service.count({ where }),
    ]);

    return { data, total };
  }

  findByIdInBusiness(tenantId: string, businessId: string, serviceId: string) {
    return this.prisma.service.findFirst({
      where: {
        id: serviceId,
        tenant_id: tenantId,
        business_id: businessId,
      },
      include: { category: true },
    });
  }

  findBySlugInBusiness(tenantId: string, businessId: string, slug: string) {
    return this.prisma.service.findFirst({
      where: {
        tenant_id: tenantId,
        business_id: businessId,
        slug,
      },
    });
  }

  findBySlugInBusinessExcludingId(
    tenantId: string,
    businessId: string,
    slug: string,
    excludeId: string,
  ) {
    return this.prisma.service.findFirst({
      where: {
        tenant_id: tenantId,
        business_id: businessId,
        slug,
        id: { not: excludeId },
      },
    });
  }

  create(data: Prisma.ServiceUncheckedCreateInput) {
    return this.prisma.service.create({
      data,
      include: { category: true },
    });
  }

  update(
    tenantId: string,
    businessId: string,
    serviceId: string,
    data: Prisma.ServiceUncheckedUpdateInput,
  ) {
    void tenantId;
    void businessId;

    return this.prisma.service.update({
      where: { id: serviceId },
      data,
      include: { category: true },
    });
  }

  private toListWhere(params: ListServicesParams): Prisma.ServiceWhereInput {
    return {
      tenant_id: params.tenantId,
      business_id: params.businessId,
      ...(params.categoryId !== undefined
        ? { category_id: params.categoryId }
        : {}),
      ...(params.status
        ? { status: params.status }
        : params.includeArchived
          ? {}
          : { status: { not: service_status.ARCHIVED } }),
      ...(params.search
        ? {
            OR: [
              { name: { contains: params.search, mode: 'insensitive' } },
              { slug: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
  }
}
