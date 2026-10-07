import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CheckOwnerBusinessSlugUseCase {
  constructor(private readonly tenants: TenantRepository) {}

  async execute(slug: string) {
    const existingTenant = await this.tenants.findBySlug(slug);

    return {
      slug,
      available: !existingTenant,
    };
  }
}
