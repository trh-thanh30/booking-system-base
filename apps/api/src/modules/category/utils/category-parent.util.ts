import { BadRequestError } from '@/common/response';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { Injectable } from '@nestjs/common';
import { category_status, category_type } from '@prisma/client';

type ParentValidationInput = {
  tenantId: string;
  businessId: string;
  parentId: string | null | undefined;
  type: category_type;
  currentCategoryId?: string;
};

@Injectable()
export class CategoryParentValidator {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async validate(input: ParentValidationInput) {
    if (!input.parentId) {
      return;
    }

    if (input.parentId === input.currentCategoryId) {
      throw new BadRequestError('Category cannot be its own parent');
    }

    const parent = await this.categoryRepository.findByIdInBusiness(
      input.tenantId,
      input.businessId,
      input.parentId,
    );

    if (!parent) {
      throw new BadRequestError('Parent category was not found');
    }

    if (parent.type !== input.type) {
      throw new BadRequestError('Parent category must have the same type');
    }

    if (parent.status === category_status.ARCHIVED) {
      throw new BadRequestError('Parent category is archived');
    }

    if (!input.currentCategoryId) {
      return;
    }

    const parentChain = await this.categoryRepository.findParentChain(
      input.tenantId,
      input.businessId,
      parent.id,
    );

    const createsCycle = parentChain.some(
      (category) => category.id === input.currentCategoryId,
    );

    if (createsCycle) {
      throw new BadRequestError('Category parent would create a cycle');
    }
  }
}
