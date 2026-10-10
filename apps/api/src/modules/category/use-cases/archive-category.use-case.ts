import { ConflictError, NotFoundError } from '@/common/response';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { toCategorySummary } from '@/modules/category/types/category.types';
import { Injectable } from '@nestjs/common';
import { category_status } from '@prisma/client';

@Injectable()
export class ArchiveCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(tenantId: string, businessId: string, categoryId: string) {
    const current = await this.categoryRepository.findByIdInBusiness(
      tenantId,
      businessId,
      categoryId,
    );

    if (!current) {
      throw new NotFoundError('Category not found');
    }

    if (current.status === category_status.ARCHIVED) {
      return toCategorySummary(current);
    }

    const childCount = await this.categoryRepository.countNonArchivedChildren(
      tenantId,
      businessId,
      categoryId,
    );

    if (childCount > 0) {
      throw new ConflictError(
        'Archive every child category before archiving this category',
        'CATEGORY_HAS_CHILDREN',
        { childCount },
      );
    }

    const serviceCount = await this.categoryRepository.countNonArchivedServices(
      tenantId,
      businessId,
      categoryId,
    );

    if (serviceCount > 0) {
      throw new ConflictError(
        'Archive or move every service before archiving this category',
        'CATEGORY_HAS_SERVICES',
        { serviceCount },
      );
    }

    const category = await this.categoryRepository.update(
      tenantId,
      businessId,
      categoryId,
      { status: category_status.ARCHIVED },
    );

    return toCategorySummary(category);
  }
}
