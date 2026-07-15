import { BusinessRepository } from '@/modules/business/repository/business.repository';
import { toBusinessContext } from '@/modules/business/business.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListBusinessesUseCase {
  constructor(private readonly businessRepository: BusinessRepository) {}

  async execute(tenantId: string) {
    const businesses = await this.businessRepository.listByTenant(tenantId);
    return businesses.map(toBusinessContext);
  }
}
