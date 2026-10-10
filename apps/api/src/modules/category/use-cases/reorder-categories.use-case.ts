import { NotFoundError, ValidationError } from '@/common/response';
import { ReorderCategoriesDto } from '@/modules/category/dto/reorder-categories.dto';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { toCategorySummary } from '@/modules/category/types/category.types';
import { Injectable } from '@nestjs/common';
import { category_status } from '@prisma/client';

@Injectable()
export class ReorderCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    tenantId: string,
    businessId: string,
    dto: ReorderCategoriesDto,
  ) {
    const categoryIds = dto.category_ids;

    if (new Set(categoryIds).size !== categoryIds.length) {
      throw new ValidationError(
        'Category IDs must be unique',
        'CATEGORY_REORDER_DUPLICATE_ID',
      );
    }

    const categories = await this.categoryRepository.findByIdsInBusiness(
      tenantId,
      businessId,
      categoryIds,
    );

    if (categories.length !== categoryIds.length) {
      throw new NotFoundError('Category not found');
    }

    const firstCategory = categories[0];
    if (!firstCategory) {
      throw new ValidationError(
        'At least one category is required',
        'CATEGORY_REORDER_EMPTY',
      );
    }

    const hasInvalidScope = categories.some(
      (category) =>
        category.type !== firstCategory.type ||
        category.parent_id !== firstCategory.parent_id ||
        category.status === category_status.ARCHIVED,
    );

    if (hasInvalidScope) {
      throw new ValidationError(
        'Categories must be active siblings with the same type and parent',
        'CATEGORY_REORDER_SCOPE_MISMATCH',
      );
    }

    const siblings = await this.categoryRepository.findReorderScopeInBusiness(
      tenantId,
      businessId,
      firstCategory.type,
      firstCategory.parent_id,
    );

    if (
      siblings.length !== categoryIds.length ||
      siblings.some((category) => !categoryIds.includes(category.id))
    ) {
      throw new ValidationError(
        'The complete category group is required for reordering',
        'CATEGORY_REORDER_INCOMPLETE',
      );
    }

    const reordered = await this.categoryRepository.reorder(
      tenantId,
      businessId,
      categoryIds.map((id, sortOrder) => ({
        id,
        sort_order: sortOrder,
      })),
    );

    return reordered.map(toCategorySummary);
  }
}
