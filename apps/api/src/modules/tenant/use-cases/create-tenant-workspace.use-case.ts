import { ConflictError } from '@/common/response';
import { toBusinessContext } from '@/modules/business/business.types';
import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { normalizeHost, toTenantContext } from '@/modules/tenant/tenant.types';
import { Injectable } from '@nestjs/common';

export interface CreateTenantWorkspaceInput {
  tenant: {
    slug: string;
    name: string;
    timezone?: string;
    locale?: string;
    primaryDomain?: string;
    defaultBusinessName?: string;
    defaultBusinessSlug?: string;
    settings?: Record<string, unknown>;
  };
  owner: {
    email: string;
    username: string;
    password: string;
    full_name?: string;
    phone?: string;
  };
}

@Injectable()
export class CreateTenantWorkspaceUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(input: CreateTenantWorkspaceInput) {
    await this.assertTenantIsUnique(
      input.tenant.slug,
      input.tenant.primaryDomain,
    );

    const result = await this.tenantRepository.createTenantWithOwner({
      tenant: {
        ...input.tenant,
        primaryDomain: input.tenant.primaryDomain
          ? normalizeHost(input.tenant.primaryDomain)
          : undefined,
      },
      owner: input.owner,
    });

    return {
      tenant: toTenantContext(result.tenant),
      business: toBusinessContext(result.business),
      owner: {
        id: result.owner.id,
        tenant_id: result.owner.tenant_id,
        email: result.owner.email,
        username: result.owner.username,
        full_name: result.owner.full_name,
        role: result.owner.role,
        status: result.owner.status,
        is_verified: result.owner.is_verified,
      },
    };
  }

  private async assertTenantIsUnique(
    slug: string,
    primaryDomain?: string,
  ): Promise<void> {
    const existingSlug = await this.tenantRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('Tenant slug is already taken');
    }

    if (!primaryDomain) {
      return;
    }

    const normalizedDomain = normalizeHost(primaryDomain);
    const existingDomain =
      await this.tenantRepository.findDomainByHost(normalizedDomain);
    if (existingDomain) {
      throw new ConflictError('Tenant domain is already taken');
    }
  }
}
