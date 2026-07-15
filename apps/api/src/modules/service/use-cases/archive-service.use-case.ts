import { NotFoundError } from '@/common/response';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import { toServiceDetail } from '@/modules/service/service.types';
import { Injectable } from '@nestjs/common';
import { service_status } from '@prisma/client';

@Injectable()
export class ArchiveServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(tenantId: string, businessId: string, serviceId: string) {
    const current = await this.serviceRepository.findByIdInBusiness(
      tenantId,
      businessId,
      serviceId,
    );

    if (!current) {
      throw new NotFoundError('Service not found');
    }

    if (current.status === service_status.ARCHIVED) {
      return toServiceDetail(current);
    }

    const service = await this.serviceRepository.update(
      tenantId,
      businessId,
      serviceId,
      { status: service_status.ARCHIVED },
    );

    return toServiceDetail(service);
  }
}
