import { ConflictError, NotFoundError } from '@/common/response';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { UpdateServiceDto } from '@/modules/service/dto/update-service.dto';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import { toServiceDetail } from '@/modules/service/service.types';
import { validateServiceCategory } from '@/modules/service/use-cases/service-category.util';
import {
  normalizeServiceCurrency,
  normalizeServiceName,
  normalizeServiceSlug,
} from '@/modules/service/use-cases/service-input.util';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class UpdateServiceUseCase {
  constructor(
    private readonly serviceRepository: ServiceRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(
    tenantId: string,
    businessId: string,
    serviceId: string,
    dto: UpdateServiceDto,
  ) {
    const current = await this.serviceRepository.findByIdInBusiness(
      tenantId,
      businessId,
      serviceId,
    );

    if (!current) {
      throw new NotFoundError('Service not found');
    }

    const nextSlug =
      dto.slug !== undefined ? normalizeServiceSlug(dto.slug) : undefined;

    if (nextSlug && nextSlug !== current.slug) {
      const existing =
        await this.serviceRepository.findBySlugInBusinessExcludingId(
          tenantId,
          businessId,
          nextSlug,
          current.id,
        );

      if (existing) {
        throw new ConflictError('Service slug is already taken');
      }
    }

    if (dto.category_id !== undefined) {
      await validateServiceCategory(
        this.categoryRepository,
        tenantId,
        businessId,
        dto.category_id,
      );
    }

    const data: Prisma.ServiceUncheckedUpdateInput = {
      ...(dto.category_id !== undefined
        ? { category_id: dto.category_id }
        : {}),
      ...(dto.name !== undefined
        ? { name: normalizeServiceName(dto.name) }
        : {}),
      ...(nextSlug ? { slug: nextSlug } : {}),
      ...(dto.description !== undefined
        ? { description: dto.description ?? null }
        : {}),
      ...(dto.duration_minutes !== undefined
        ? { duration_minutes: dto.duration_minutes }
        : {}),
      ...(dto.buffer_before_minutes !== undefined
        ? { buffer_before_minutes: dto.buffer_before_minutes }
        : {}),
      ...(dto.buffer_after_minutes !== undefined
        ? { buffer_after_minutes: dto.buffer_after_minutes }
        : {}),
      ...(dto.price_amount !== undefined
        ? { price_amount: dto.price_amount }
        : {}),
      ...(dto.currency !== undefined
        ? { currency: normalizeServiceCurrency(dto.currency) }
        : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
      ...(dto.sort_order !== undefined ? { sort_order: dto.sort_order } : {}),
    };

    const service = await this.serviceRepository.update(
      tenantId,
      businessId,
      serviceId,
      data,
    );

    return toServiceDetail(service);
  }
}
