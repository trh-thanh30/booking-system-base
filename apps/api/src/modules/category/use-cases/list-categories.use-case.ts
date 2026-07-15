import { PaginatedResponse } from '@/common/response';
import { ListCategoriesDto } from '@/modules/category/dto/list-categories.dto';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { toCategorySummary } from '@/modules/category/types/category.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(
    tenantId: string,
    businessId: string,
    query: ListCategoriesDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const search = query.search?.trim() || undefined;

    const { data, total } = await this.categoryRepository.list({
      tenantId,
      businessId,
      type: query.type,
      status: query.status,
      search,
      parentId: query.parent_id,
      includeArchived: query.include_archived,
      page,
      limit,
    });

    return PaginatedResponse.from(
      data.map(toCategorySummary),
      page,
      limit,
      total,
      'Categories retrieved successfully',
    );
  }
}
