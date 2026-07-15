import { NotFoundError } from '@/common/response';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import { toServiceDetail } from '@/modules/service/service.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class GetServiceUseCase {
  constructor(private readonly serviceRepository: ServiceRepository) {}

  async execute(tenantId: string, businessId: string, serviceId: string) {
    const service = await this.serviceRepository.findByIdInBusiness(
      tenantId,
      businessId,
      serviceId,
    );

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    return toServiceDetail(service);
  }
}
