import { NotFoundError } from '@/common/response';
import type { TenantResolveResult } from '@/common/types/tenant-context.types';
import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import {
  normalizeHost,
  toTenantDomainSummary,
  toTenantSummary,
} from '@/modules/tenant/tenant.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ResolveTenantUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(host: string): Promise<TenantResolveResult> {
    const normalizedHost = normalizeHost(host);
    const domain = await this.tenantRepository.findDomainByHost(normalizedHost);

    if (!domain) {
      throw new NotFoundError('Tenant domain not found');
    }

    return {
      tenant: toTenantSummary(domain.tenant),
      domain: toTenantDomainSummary(domain),
    };
  }
}
