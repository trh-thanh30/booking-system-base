import { BcryptService } from '@/common/helpers/bcrypt.util';
import { BadRequestError, ConflictError } from '@/common/response';
import { toBusinessContext } from '@/modules/business/business.types';
import { SignupTenantDto } from '@/modules/tenant/dto/signup-tenant.dto';
import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { normalizeHost, toTenantContext } from '@/modules/tenant/tenant.types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SignupTenantUseCase {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly bcryptService: BcryptService,
  ) {}

  async execute(dto: SignupTenantDto) {
    if (dto.owner.password !== dto.owner.confirmPassword) {
      throw new BadRequestError('Confirm password does not match');
    }

    await this.assertSignupIsUnique(dto);
    const hashedPassword = await this.bcryptService.hashPassword(
      dto.owner.password,
    );

    const result = await this.tenantRepository.createTenantWithOwner({
      tenant: {
        slug: dto.slug,
        name: dto.name,
        timezone: dto.timezone,
        locale: dto.locale,
        primaryDomain: dto.primary_domain
          ? normalizeHost(dto.primary_domain)
          : undefined,
        defaultBusinessName: dto.default_business_name,
        defaultBusinessSlug: dto.default_business_slug,
        settings: dto.settings,
      },
      owner: {
        email: dto.owner.email,
        username: dto.owner.username,
        password: hashedPassword,
        full_name: dto.owner.full_name,
        phone: dto.owner.phone,
      },
    });
    if (!result.business) {
      throw new BadRequestError('Default business was not created');
    }

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

  private async assertSignupIsUnique(dto: SignupTenantDto) {
    const existingSlug = await this.tenantRepository.findBySlug(dto.slug);
    if (existingSlug) {
      throw new ConflictError('Tenant slug is already taken');
    }

    if (dto.primary_domain) {
      const existingDomain = await this.tenantRepository.findDomainByHost(
        normalizeHost(dto.primary_domain),
      );
      if (existingDomain) {
        throw new ConflictError('Tenant domain is already taken');
      }
    }

    const existingUser = await this.tenantRepository.findUserIdentity(
      dto.owner.email,
      dto.owner.username,
      dto.owner.phone,
    );
    if (existingUser) {
      throw new ConflictError('Owner account already exists');
    }
  }
}
