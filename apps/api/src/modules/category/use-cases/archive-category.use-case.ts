import { NotFoundError } from '@/common/response';
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

    const category = await this.categoryRepository.update(
      tenantId,
      businessId,
      categoryId,
      { status: category_status.ARCHIVED },
    );

    return toCategorySummary(category);
  }
}
