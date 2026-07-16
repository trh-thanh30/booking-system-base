import { BadRequestError } from '@/common/response';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { Injectable } from '@nestjs/common';
import { category_status, category_type } from '@prisma/client';

@Injectable()
export class ServiceCategoryValidator {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async validate(
    tenantId: string,
    businessId: string,
    categoryId: string | null | undefined,
  ) {
    if (!categoryId) {
      return;
    }

    const category = await this.categoryRepository.findByIdInBusiness(
      tenantId,
      businessId,
      categoryId,
    );

    if (!category) {
      throw new BadRequestError('Service category was not found');
    }

    if (category.type !== category_type.SERVICE) {
      throw new BadRequestError('Category must be a SERVICE category');
    }

    if (category.status === category_status.ARCHIVED) {
      throw new BadRequestError('Service category is archived');
    }
  }
}
