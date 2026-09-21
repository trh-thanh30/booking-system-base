import { ConflictError } from '@/common/response';
import { CreateCategoryDto } from '@/modules/category/dto/create-category.dto';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { toCategorySummary } from '@/modules/category/types/category.types';
import { CategoryInputNormalizer } from '@/modules/category/utils/category-input.util';
import { CategoryParentValidator } from '@/modules/category/utils/category-parent.util';
import { Injectable } from '@nestjs/common';
import { category_status, type Prisma } from '@prisma/client';

@Injectable()
export class CreateCategoryUseCase {
  constructor(
    private readonly categoryRepository: CategoryRepository,
    private readonly categoryInputNormalizer: CategoryInputNormalizer,
    private readonly categoryParentValidator: CategoryParentValidator,
  ) {}

  async execute(tenantId: string, businessId: string, dto: CreateCategoryDto) {
    const name = this.categoryInputNormalizer.normalizeName(dto.name);
    const slug = this.categoryInputNormalizer.normalizeSlug(dto.slug ?? name);
    const status = dto.status ?? category_status.ACTIVE;

    await this.categoryParentValidator.validate({
      tenantId,
      businessId,
      parentId: dto.parent_id,
      type: dto.type,
    });

    const existing = await this.categoryRepository.findBySlugInBusiness(
      tenantId,
      businessId,
      dto.type,
      slug,
    );

    if (existing) {
      throw new ConflictError('Category slug is already taken');
    }

    const category = await this.categoryRepository.create({
      tenant_id: tenantId,
      business_id: businessId,
      type: dto.type,
      name,
      slug,
      description: dto.description ?? null,
      status,
      sort_order: dto.sort_order ?? 0,
      parent_id: dto.parent_id ?? null,
      metadata: (dto.metadata ?? {}) as Prisma.InputJsonValue,
    });

    return toCategorySummary(category);
  }
}
