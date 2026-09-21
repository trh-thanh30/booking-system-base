import { ConflictError, NotFoundError } from '@/common/response';
import { UpdateCategoryDto } from '@/modules/category/dto/update-category.dto';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { toCategorySummary } from '@/modules/category/types/category.types';
import { CategoryInputNormalizer } from '@/modules/category/utils/category-input.util';
import { CategoryParentValidator } from '@/modules/category/utils/category-parent.util';
import { Injectable } from '@nestjs/common';
import { type Prisma } from '@prisma/client';

@Injectable()
export class UpdateCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryInputNormalizer: CategoryInputNormalizer,
    private readonly categoryParentValidator: CategoryParentValidator,
  ) {}

  async execute(
    tenantId: string,
    businessId: string,
    categoryId: string,
    dto: UpdateCategoryDto,
  ) {
    const current = await this.categoryRepository.findByIdInBusiness(
      tenantId,
      businessId,
      categoryId,
    );

    if (!current) {
      throw new NotFoundError('Category not found');
    }

    const nextSlug =
      dto.slug !== undefined
        ? this.categoryInputNormalizer.normalizeSlug(dto.slug)
        : undefined;

    if (nextSlug && nextSlug !== current.slug) {
      const existing =
        await this.categoryRepository.findBySlugInBusinessExcludingId(
          tenantId,
          businessId,
          current.type,
          nextSlug,
          current.id,
        );

      if (existing) {
        throw new ConflictError('Category slug is already taken');
      }
    }

    if (dto.parent_id !== undefined) {
      await this.categoryParentValidator.validate({
        tenantId,
        businessId,
        parentId: dto.parent_id,
        type: current.type,
        currentCategoryId: current.id,
      });
    }

    const data: Prisma.CategoryUncheckedUpdateInput = {
      ...(dto.name !== undefined
        ? { name: this.categoryInputNormalizer.normalizeName(dto.name) }
        : {}),
      ...(nextSlug ? { slug: nextSlug } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ?? null }
        : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
      ...(dto.parent_id !== undefined ? { parent_id: dto.parent_id } : {}),
      ...(dto.metadata !== undefined
        ? { metadata: dto.metadata as Prisma.InputJsonValue }
        : {}),
    };

    const category = await this.categoryRepository.update(
      tenantId,
      businessId,
      categoryId,
      data,
    );

    return toCategorySummary(category);
  }
}
