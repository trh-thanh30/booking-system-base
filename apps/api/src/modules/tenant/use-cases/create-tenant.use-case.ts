import { ConflictError } from '@/common/response';
import { CreateTenantDto } from '@/modules/tenant/dto/create-tenant.dto';
import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { normalizeHost, toTenantContext } from '@/modules/tenant/tenant.types';
import { Injectable } from '@nestjs/common';
import {
  business_status,
  tenant_domain_type,
  tenant_status,
  type Prisma,
} from '@prisma/client';

@Injectable()
export class CreateTenantUseCase {
  constructor(private readonly tenantRepository: TenantRepository) {}

  async execute(dto: CreateTenantDto) {
    await this.assertTenantIsUnique(dto.slug, dto.primary_domain);

    const tenant = await this.tenantRepository.createTenant({
      slug: dto.slug,
      name: dto.name,
      status: dto.status ?? tenant_status.ACTIVE,
      timezone: dto.timezone ?? 'Asia/Ho_Chi_Minh',
      locale: dto.locale ?? 'vi',
      domains: dto.primary_domain
        ? {
            create: {
              host: normalizeHost(dto.primary_domain),
              type: tenant_domain_type.SUBDOMAIN,
              is_primary: true,
            },
          }
        : undefined,
      settings: {
        create: {
          settings: (dto.settings ?? {}) as Prisma.InputJsonValue,
        },
      },
      businesses: {
        create: {
          slug: dto.default_business_slug ?? dto.slug,
          name: dto.default_business_name ?? dto.name,
          status: business_status.ACTIVE,
          timezone: dto.timezone ?? 'Asia/Ho_Chi_Minh',
          locale: dto.locale ?? 'vi',
          settings: (dto.settings ?? {}) as Prisma.InputJsonValue,
          is_default: true,
        },
      },
    });

    return toTenantContext(tenant);
  }

  private async assertTenantIsUnique(slug: string, primaryDomain?: string) {
    const existingSlug = await this.tenantRepository.findBySlug(slug);
    if (existingSlug) {
      throw new ConflictError('Tenant slug is already taken');
    }

    if (!primaryDomain) {
      return;
    }

    const existingDomain = await this.tenantRepository.findDomainByHost(
      normalizeHost(primaryDomain),
    );
    if (existingDomain) {
      throw new ConflictError('Tenant domain is already taken');
    }
  }
}
