import { PrismaService } from '@/database/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  tenant_domain_type,
  tenant_status,
  user_role,
  user_status,
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

  findUserIdentity(email: string, username: string, phone?: string | null) {
    return this.prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }, ...(phone ? [{ phone }] : [])],
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
      },
    });
  }

  listTenants() {
    return this.prisma.tenant.findMany({
      include: {
        domains: true,
        settings: true,
        _count: {
          select: {
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
      settings?: Record<string, unknown>;
    };
    owner: {
      email: string;
      username: string;
      password: string;
      full_name?: string;
      phone?: string;
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
        },
        include: {
          domains: true,
          settings: true,
        },
      });

      const owner = await tx.user.create({
        data: {
          tenant_id: tenant.id,
          email: input.owner.email,
          username: input.owner.username,
          password: input.owner.password,
          full_name: input.owner.full_name,
          phone: input.owner.phone,
          role: user_role.OWNER,
          status: user_status.ACTIVE,
          is_verified: true,
        },
      });

      return { tenant, owner };
    });
  }
}
