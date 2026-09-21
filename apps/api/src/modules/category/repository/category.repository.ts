import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  category_status,
  category_type,
  Prisma,
  type Category,
} from '@prisma/client';

export type ListCategoriesParams = {
  tenantId: string;
  businessId: string;
  type?: category_type;
  status?: category_status;
  search?: string;
  parentId?: string | null;
  includeArchived?: boolean;
  page: number;
  limit: number;
};

@Injectable()
export class CategoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async list(params: ListCategoriesParams) {
    const where = this.toListWhere(params);
    const skip = (params.page - 1) * params.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }, { id: 'asc' }],
        skip,
        take: params.limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data, total };
  }

  findByIdInBusiness(tenantId: string, businessId: string, categoryId: string) {
    return this.prisma.category.findFirst({
      where: {
        id: categoryId,
        tenant_id: tenantId,
        business_id: businessId,
      },
    });
  }

  findBySlugInBusiness(
    tenantId: string,
    businessId: string,
    type: category_type,
    slug: string,
  ) {
    return this.prisma.category.findFirst({
      where: {
        tenant_id: tenantId,
        business_id: businessId,
        type,
        slug,
      },
    });
  }

  findBySlugInBusinessExcludingId(
    tenantId: string,
    businessId: string,
    type: category_type,
    slug: string,
    excludeId: string,
  ) {
    return this.prisma.category.findFirst({
      where: {
        tenant_id: tenantId,
        business_id: businessId,
        type,
        slug,
        id: { not: excludeId },
      },
    });
  }

  create(data: Prisma.CategoryUncheckedCreateInput) {
    return this.prisma.category.create({ data });
  }

  update(
    tenantId: string,
    businessId: string,
    categoryId: string,
    data: Prisma.CategoryUncheckedUpdateInput,
  ) {
    void tenantId;
    void businessId;

    return this.prisma.category.update({
      where: {
        id: categoryId,
      },
      data,
    });
  }

  async findParentChain(
    tenantId: string,
    businessId: string,
    categoryId: string,
    maxDepth = 20,
  ) {
    const chain: Pick<Category, 'id' | 'parent_id'>[] = [];
    let currentId: string | null = categoryId;
    let depth = 0;

    while (currentId && depth < maxDepth) {
      const current = await this.prisma.category.findFirst({
        where: {
          id: currentId,
          tenant_id: tenantId,
          business_id: businessId,
        },
        select: {
          id: true,
          parent_id: true,
        },
      });

      if (!current) {
        break;
      }

      chain.push(current);
      currentId = current.parent_id;
      depth += 1;
    }

    return chain;
  }

  private toListWhere(params: ListCategoriesParams): Prisma.CategoryWhereInput {
    return {
      tenant_id: params.tenantId,
      business_id: params.businessId,
      ...(params.type ? { type: params.type } : {}),
      ...(params.status
        ? { status: params.status }
        : params.includeArchived
          ? {}
          : { status: { not: category_status.ARCHIVED } }),
      ...(params.parentId !== undefined ? { parent_id: params.parentId } : {}),
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
