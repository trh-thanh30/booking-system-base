import { GetTenantContextUseCase } from '@/modules/tenant/use-cases/get-tenant-context.use-case';
import { tenant_domain_type, tenant_status } from '@prisma/client';

function makeTenant() {
  return {
    id: 'tenant-1',
    slug: 'demo-spa',
    name: 'Demo Spa',
    status: tenant_status.ACTIVE,
    timezone: 'Asia/Ho_Chi_Minh',
    locale: 'vi-VN',
    domains: [
      {
        id: 'domain-1',
        host: 'demo.localhost',
        type: tenant_domain_type.SUBDOMAIN,
        is_primary: true,
      },
    ],
    settings: {
      settings: {
        brand_color: '#2563eb',
        booking_window_days: 30,
      },
    },
  };
}

describe('GetTenantContextUseCase', () => {
  it('returns tenant context with domains and settings', async () => {
    const repository = {
      findContextById: jest.fn().mockResolvedValue(makeTenant()),
    };

    await expect(
      new GetTenantContextUseCase(repository as any).execute('tenant-1'),
    ).resolves.toEqual({
      id: 'tenant-1',
      slug: 'demo-spa',
      name: 'Demo Spa',
      status: tenant_status.ACTIVE,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi-VN',
      settings: {
        brand_color: '#2563eb',
        booking_window_days: 30,
      },
      domains: [
        {
          id: 'domain-1',
          host: 'demo.localhost',
          type: tenant_domain_type.SUBDOMAIN,
          is_primary: true,
        },
      ],
    });

    expect(repository.findContextById).toHaveBeenCalledWith('tenant-1');
  });

  it('rejects unknown tenants', async () => {
    const repository = {
      findContextById: jest.fn().mockResolvedValue(null),
    };

    await expect(
      new GetTenantContextUseCase(repository as any).execute('tenant-missing'),
    ).rejects.toThrow('Tenant not found');
  });
});
