import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  business_status,
  tenant_domain_type,
  tenant_status,
  user_role,
  user_status,
  identity_provider,
  type Prisma,
} from '@prisma/client';

@Injectable()
export class TenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  findDomainByHost(host: string) {
    return this.prisma.tenantDomain.findUnique({
      where: { host },
      include: {
        tenant: {
          include: {
            businesses: true,
            domains: true,
            settings: true,
          },
        },
      },
    });
  }

  findContextById(tenantId: string) {
    return this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        businesses: true,
        domains: true,
        settings: true,
      },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.tenant.findUnique({
      where: { slug },
      select: { id: true },
    });
  }

  listTenants() {
    return this.prisma.tenant.findMany({
      include: {
        businesses: true,
        domains: true,
        settings: true,
        _count: {
          select: {
            businesses: true,
            users: true,
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  createTenant(data: Prisma.TenantCreateInput) {
    return this.prisma.tenant.create({
      data,
      include: {
        businesses: true,
        domains: true,
        settings: true,
      },
    });
  }

  createTenantWithOwner(input: {
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
      password: string | null;
      full_name?: string;
      phone?: string;
      avatar_url?: string;
      isVerified?: boolean;
      identity?: {
        provider: identity_provider;
        providerAccountId: string;
        providerEmail: string;
      };
    };
  }) {
    return this.prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          slug: input.tenant.slug,
          name: input.tenant.name,
          status: tenant_status.ACTIVE,
          timezone: input.tenant.timezone ?? 'Asia/Ho_Chi_Minh',
          locale: input.tenant.locale ?? 'vi',
          domains: input.tenant.primaryDomain
            ? {
                create: {
                  host: input.tenant.primaryDomain,
                  type: tenant_domain_type.SUBDOMAIN,
                  is_primary: true,
                },
              }
            : undefined,
          settings: {
            create: {
              settings: (input.tenant.settings ?? {}) as Prisma.InputJsonValue,
            },
          },
          businesses: {
            create: {
              slug: input.tenant.defaultBusinessSlug ?? input.tenant.slug,
              name: input.tenant.defaultBusinessName ?? input.tenant.name,
              status: business_status.ACTIVE,
              timezone: input.tenant.timezone ?? 'Asia/Ho_Chi_Minh',
              locale: input.tenant.locale ?? 'vi',
              settings: (input.tenant.settings ?? {}) as Prisma.InputJsonValue,
              is_default: true,
            },
          },
        },
        include: {
          businesses: true,
          domains: true,
          settings: true,
        },
      });

      const defaultBusiness = tenant.businesses.find(
        (business) => business.is_default,
      );

      if (!defaultBusiness) {
        throw new Error('Default business was not created');
      }

      const owner = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          email: input.owner.email,
          username: input.owner.username,
          password: input.owner.password,
          full_name: input.owner.full_name,
          phone: input.owner.phone,
          avatar_url: input.owner.avatar_url,
          role: user_role.OWNER,
          status: user_status.ACTIVE,
          is_verified: input.owner.isVerified ?? false,
          identities: input.owner.identity
            ? {
                create: {
                  provider: input.owner.identity.provider,
                  provider_account_id: input.owner.identity.providerAccountId,
                  provider_email: input.owner.identity.providerEmail,
                },
              }
            : undefined,
        },
      });

      await tx.businessMembership.create({
        data: {
          tenant_id: tenant.id,
          business_id: defaultBusiness.id,
          user_id: owner.id,
        },
      });

      return { tenant, business: defaultBusiness, owner };
    });
  }
}
