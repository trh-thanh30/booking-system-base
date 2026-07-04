import { NotFoundError } from '@/common/response';
import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { toTenantContext } from '@/modules/tenant/tenant.types';
import { Injectable } from '@nestjs/common';
import type { TenantContext } from '@repo/shared';

@Injectable()
export class GetTenantContextUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(tenantId: string): Promise<TenantContext> {
    const tenant = await this.tenantRepository.findContextById(tenantId);

    if (!tenant) {
      throw new NotFoundError('Tenant not found');
    }

    return toTenantContext(tenant);
  }
}
