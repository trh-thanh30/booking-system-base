import { NotFoundError } from '@/common/response';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { toCategorySummary } from '@/modules/category/types/category.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(tenantId: string, businessId: string, categoryId: string) {
    const category = await this.categoryRepository.findByIdInBusiness(
      tenantId,
      businessId,
      categoryId,
    );

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    return toCategorySummary(category);
  }
}
