import { PrismaService } from '@/database/prisma/prisma.service';
import { AssetsService } from '@/modules/assets/assets.service';
import { Injectable } from '@nestjs/common';
import {
  CATEGORY_ASSET_ENTITY_TYPE,
  type CategoryAssetSummary,
} from '@repo/shared';
import {
  asset_access_type,
  category_status,
  category_type,
  Prisma,
  service_status,
  type Category,
} from '@prisma/client';

const categoryContextInclude = {
  parent: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  _count: {
    select: {
      children: {
        where: { status: { not: category_status.ARCHIVED } },
      },
      services: {
        where: { status: { not: service_status.ARCHIVED } },
      },
    },
  },
} satisfies Prisma.CategoryInclude;

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly assetsService: AssetsService,
  ) {}

  async list(params: ListCategoriesParams) {
    const where = this.toListWhere(params);
    const skip = (params.page - 1) * params.limit;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.category.findMany({
        where,
        include: categoryContextInclude,
        orderBy: [{ sort_order: 'asc' }, { name: 'asc' }, { id: 'asc' }],
        skip,
        take: params.limit,
      }),
      this.prisma.category.count({ where }),
    ]);

    return { data: await this.withAssets(data), total };
  }

  async findByIdInBusiness(
    tenantId: string,
    businessId: string,
    categoryId: string,
  ) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: categoryId,
        tenant_id: tenantId,
        business_id: businessId,
      },
      include: categoryContextInclude,
    });

    if (!category) return null;
    const [result] = await this.withAssets([category]);
    return result ?? null;
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

  findByIdsInBusiness(
    tenantId: string,
    businessId: string,
    categoryIds: string[],
  ) {
    return this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
        tenant_id: tenantId,
        business_id: businessId,
      },
    });
  }

  findAssetsByIdsInTenant(tenantId: string, assetIds: string[]) {
    return this.prisma.asset.findMany({
      where: {
        id: { in: assetIds },
        tenant_id: tenantId,
        is_deleted: false,
      },
    });
  }

  findReorderScopeInBusiness(
    tenantId: string,
    businessId: string,
    type: category_type,
    parentId: string | null,
  ) {
    return this.prisma.category.findMany({
      where: {
        tenant_id: tenantId,
        business_id: businessId,
        type,
        parent_id: parentId,
        status: { not: category_status.ARCHIVED },
      },
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    });
  }

  async create(
    data: Prisma.CategoryUncheckedCreateInput,
    assetIds: string[] = [],
  ) {
    const category = await this.prisma.$transaction(async (transaction) => {
      const category = await transaction.category.create({
        data,
        include: categoryContextInclude,
      });

      if (assetIds.length > 0) {
        await transaction.assetLink.createMany({
          data: assetIds.map((assetId, sortOrder) => ({
            asset_id: assetId,
            entity_id: category.id,
            entity_type: CATEGORY_ASSET_ENTITY_TYPE,
            sort_order: sortOrder,
          })),
        });
      }

      return category;
    });

    if (!category.business_id) {
      throw new Error('Created business category has no business');
    }

    const created = await this.findByIdInBusiness(
      category.tenant_id,
      category.business_id,
      category.id,
    );
    if (!created) throw new Error('Created category could not be loaded');
    return created;
  }

  countNonArchivedServices(
    tenantId: string,
    businessId: string,
    categoryId: string,
  ) {
    return this.prisma.service.count({
      where: {
        tenant_id: tenantId,
        business_id: businessId,
        category_id: categoryId,
        status: { not: service_status.ARCHIVED },
      },
    });
  }

  countChildren(tenantId: string, businessId: string, categoryId: string) {
    return this.prisma.category.count({
      where: {
        tenant_id: tenantId,
        business_id: businessId,
        parent_id: categoryId,
      },
    });
  }

  countNonArchivedChildren(
    tenantId: string,
    businessId: string,
    categoryId: string,
  ) {
    return this.prisma.category.count({
      where: {
        tenant_id: tenantId,
        business_id: businessId,
        parent_id: categoryId,
        status: { not: category_status.ARCHIVED },
      },
    });
  }

  async reorder(
    tenantId: string,
    businessId: string,
    categories: Array<{ id: string; sort_order: number }>,
  ) {
    await this.prisma.$transaction(
      categories.map((category) =>
        this.prisma.category.updateMany({
          where: {
            id: category.id,
            tenant_id: tenantId,
            business_id: businessId,
          },
          data: { sort_order: category.sort_order },
        }),
      ),
    );

    const reordered = await this.prisma.category.findMany({
      where: {
        id: { in: categories.map((category) => category.id) },
        tenant_id: tenantId,
        business_id: businessId,
      },
      include: categoryContextInclude,
      orderBy: [{ sort_order: 'asc' }, { name: 'asc' }, { id: 'asc' }],
    });

    return this.withAssets(reordered);
  }

  async update(
    tenantId: string,
    businessId: string,
    categoryId: string,
    data: Prisma.CategoryUncheckedUpdateInput,
    assetIds?: string[],
  ) {
    const category = await this.prisma.$transaction(async (transaction) => {
      const category = await transaction.category.update({
        where: {
          id: categoryId,
          tenant_id: tenantId,
          business_id: businessId,
        },
        data,
        include: categoryContextInclude,
      });

      if (assetIds !== undefined) {
        await transaction.assetLink.deleteMany({
          where: {
            entity_id: categoryId,
            entity_type: CATEGORY_ASSET_ENTITY_TYPE,
          },
        });
        if (assetIds.length > 0) {
          await transaction.assetLink.createMany({
            data: assetIds.map((assetId, sortOrder) => ({
              asset_id: assetId,
              entity_id: categoryId,
              entity_type: CATEGORY_ASSET_ENTITY_TYPE,
              sort_order: sortOrder,
            })),
          });
        }
      }

      return category;
    });

    const updated = await this.findByIdInBusiness(
      tenantId,
      businessId,
      category.id,
    );
    if (!updated) throw new Error('Updated category could not be loaded');
    return updated;
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

  private async withAssets<T extends { id: string; tenant_id: string }>(
    categories: T[],
  ): Promise<Array<T & { assets: CategoryAssetSummary[] }>> {
    if (categories.length === 0) return [];

    const categoryIds = categories.map((category) => category.id);
    const tenantId = categories[0].tenant_id;
    const links = await this.prisma.assetLink.findMany({
      where: {
        entity_id: { in: categoryIds },
        entity_type: CATEGORY_ASSET_ENTITY_TYPE,
        asset: {
          tenant_id: tenantId,
          is_deleted: false,
          access_type: asset_access_type.PUBLIC,
          mime_type: { startsWith: 'image/' },
        },
      },
      include: { asset: true },
      orderBy: [{ sort_order: 'asc' }, { created_at: 'asc' }],
    });

    const assetsByCategory = new Map<string, CategoryAssetSummary[]>();
    for (const link of links) {
      const assets = assetsByCategory.get(link.entity_id) ?? [];
      assets.push({
        id: link.asset.id,
        original_name: link.asset.original_name,
        mime_type: link.asset.mime_type,
        sort_order: link.sort_order,
        url: this.assetsService.enrichAssetUrl(link.asset).url,
      });
      assetsByCategory.set(link.entity_id, assets);
    }

    return categories.map((category) => ({
      ...category,
      assets: assetsByCategory.get(category.id) ?? [],
    }));
  }
}
