import { PaginatedResponse } from '@/common/response';
import { ListServicesDto } from '@/modules/service/dto/list-services.dto';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import { toServiceDetail } from '@/modules/service/service.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListServicesUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(tenantId: string, businessId: string, query: ListServicesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const search = query.search?.trim() || undefined;

    const { data, total } = await this.serviceRepository.list({
      tenantId,
      businessId,
      search,
      categoryId: query.category_id,
      status: query.status,
      includeArchived: query.include_archived,
      page,
      limit,
    });

    return PaginatedResponse.from(
      data.map(toServiceDetail),
      page,
      limit,
      total,
      'Services retrieved successfully',
    );
  }
}
