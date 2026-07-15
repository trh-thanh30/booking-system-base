import { BadRequestError } from '@/common/response';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { category_status, category_type } from '@prisma/client';

export async function validateServiceCategory(
  categoryRepository: CategoryRepository,
  tenantId: string,
  businessId: string,
  categoryId: string | null | undefined,
) {
  if (!categoryId) {
    return;
  }

  const category = await categoryRepository.findByIdInBusiness(
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
