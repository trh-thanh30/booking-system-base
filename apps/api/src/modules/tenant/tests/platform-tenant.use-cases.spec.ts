import { CreateTenantUseCase } from '@/modules/tenant/use-cases/create-tenant.use-case';
import { ListTenantsUseCase } from '@/modules/tenant/use-cases/list-tenants.use-case';
import { SignupTenantUseCase } from '@/modules/tenant/use-cases/signup-tenant.use-case';
import {
  business_status,
  tenant_domain_type,
  tenant_status,
  user_role,
  user_status,
} from '@prisma/client';

function makeTenant(overrides: Record<string, unknown> = {}) {
  return {
    id: 'tenant-1',
    slug: 'demo-spa',
    name: 'Demo Spa',
    status: tenant_status.ACTIVE,
    timezone: 'Asia/Ho_Chi_Minh',
    locale: 'vi',
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
    businesses: [
      {
        id: 'business-1',
        tenant_id: 'tenant-1',
        slug: 'demo-spa',
        name: 'Demo Spa',
        status: business_status.ACTIVE,
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi',
        settings: { booking_window_days: 30 },
        is_default: true,
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        updated_at: new Date('2026-01-02T00:00:00.000Z'),
      },
    ],
    domains: [
      {
        id: 'domain-1',
        host: 'demo.localhost',
        type: tenant_domain_type.SUBDOMAIN,
        is_primary: true,
      },
    ],
    settings: { settings: { booking_window_days: 30 } },
    _count: { businesses: 1, users: 2 },
    ...overrides,
  };
}

describe('Platform tenant use cases', () => {
  it('lists tenants with context and user counts', async () => {
    const repository = {
      listTenants: jest.fn().mockResolvedValue([makeTenant()]),
    };

    await expect(
      new ListTenantsUseCase(repository as any).execute(),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 'tenant-1',
        slug: 'demo-spa',
        users_count: 2,
        domains: [
          {
            id: 'domain-1',
            host: 'demo.localhost',
            type: tenant_domain_type.SUBDOMAIN,
            is_primary: true,
          },
        ],
      }),
    ]);
  });

  it('creates tenant after checking slug and domain uniqueness', async () => {
    const repository = {
      findBySlug: jest.fn().mockResolvedValue(null),
      findDomainByHost: jest.fn().mockResolvedValue(null),
      createTenant: jest.fn().mockResolvedValue(makeTenant()),
    };

    await expect(
      new CreateTenantUseCase(repository as any).execute({
        slug: 'demo-spa',
        name: 'Demo Spa',
        primary_domain: ' DEMO.LOCALHOST:3000 ',
      } as any),
    ).resolves.toMatchObject({
      id: 'tenant-1',
      domains: [{ host: 'demo.localhost' }],
    });

    expect(repository.findDomainByHost).toHaveBeenCalledWith('demo.localhost');
    expect(repository.createTenant).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: 'demo-spa',
        domains: {
          create: expect.objectContaining({ host: 'demo.localhost' }),
        },
      }),
    );
  });

  it('rejects duplicate tenant slugs', async () => {
    const repository = {
      findBySlug: jest.fn().mockResolvedValue({ id: 'tenant-1' }),
    };

    await expect(
      new CreateTenantUseCase(repository as any).execute({
        slug: 'demo-spa',
        name: 'Demo Spa',
      } as any),
    ).rejects.toThrow('Tenant slug is already taken');
  });

  it('signs up tenant with owner account', async () => {
    const repository = {
      findBySlug: jest.fn().mockResolvedValue(null),
      findDomainByHost: jest.fn().mockResolvedValue(null),
      findUserIdentity: jest.fn().mockResolvedValue(null),
      createTenantWithOwner: jest.fn().mockResolvedValue({
        tenant: makeTenant(),
        business: makeTenant().businesses[0],
        owner: {
          id: 'owner-1',
          tenant_id: 'tenant-1',
          email: 'owner@example.com',
          username: 'owner',
          full_name: 'Owner',
          role: user_role.OWNER,
          status: user_status.ACTIVE,
          is_verified: true,
        },
      }),
    };

    await expect(
      new SignupTenantUseCase(
        repository as any,
        { hashPassword: jest.fn().mockResolvedValue('hashed-password') } as any,
      ).execute({
        slug: 'demo-spa',
        name: 'Demo Spa',
        owner: {
          email: 'owner@example.com',
          username: 'owner',
          password: 'password',
          confirmPassword: 'password',
          full_name: 'Owner',
        },
      } as any),
    ).resolves.toEqual({
      tenant: expect.objectContaining({ id: 'tenant-1' }),
      business: expect.objectContaining({
        id: 'business-1',
        is_default: true,
      }),
      owner: expect.objectContaining({
        id: 'owner-1',
        role: user_role.OWNER,
        is_verified: true,
      }),
    });

    expect(repository.createTenantWithOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: expect.objectContaining({ password: 'hashed-password' }),
      }),
    );
  });
});
