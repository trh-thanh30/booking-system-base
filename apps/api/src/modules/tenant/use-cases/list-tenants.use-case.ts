import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { toTenantListItem } from '@/modules/tenant/tenant.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListTenantsUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute() {
    const tenants = await this.tenantRepository.listTenants();
    return tenants.map(toTenantListItem);
  }
}
