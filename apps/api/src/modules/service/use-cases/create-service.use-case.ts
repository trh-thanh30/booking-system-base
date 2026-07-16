import { ConflictError } from '@/common/response';
import { CreateServiceDto } from '@/modules/service/dto/create-service.dto';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import { toServiceDetail } from '@/modules/service/service.types';
import { ServiceCategoryValidator } from '@/modules/service/utils/service-category.util';
import { ServiceInputNormalizer } from '@/modules/service/utils/service-input.util';
import { Injectable } from '@nestjs/common';
import { service_status } from '@prisma/client';

@Injectable()
export class CreateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly serviceInputNormalizer: ServiceInputNormalizer,
    private readonly serviceCategoryValidator: ServiceCategoryValidator,
  ) {}

  async execute(tenantId: string, businessId: string, dto: CreateServiceDto) {
    const name = this.serviceInputNormalizer.normalizeName(dto.name);
    const slug = this.serviceInputNormalizer.normalizeSlug(dto.slug ?? name);

    await this.serviceCategoryValidator.validate(
      tenantId,
      businessId,
      dto.category_id,
    );

    const existing = await this.serviceRepository.findBySlugInBusiness(
      tenantId,
      businessId,
      slug,
    );

    if (existing) {
      throw new ConflictError('Service slug is already taken');
    }

    const service = await this.serviceRepository.create({
      tenant_id: tenantId,
      business_id: businessId,
      category_id: dto.category_id ?? null,
      name,
      slug,
      description: dto.description ?? null,
      duration_minutes: dto.duration_minutes,
      buffer_before_minutes: dto.buffer_before_minutes ?? 0,
      buffer_after_minutes: dto.buffer_after_minutes ?? 0,
      price_amount: dto.price_amount,
      currency: this.serviceInputNormalizer.normalizeCurrency(dto.currency),
      status: dto.status ?? service_status.ACTIVE,
      sort_order: dto.sort_order ?? 0,
    });

    return toServiceDetail(service);
  }
}
