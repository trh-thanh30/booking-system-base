import { ResolveTenantUseCase } from '@/modules/tenant/use-cases/resolve-tenant.use-case';
import { tenant_domain_type, tenant_status } from '@prisma/client';

function makeDomain() {
  return {
    id: 'domain-1',
    host: 'demo.localhost',
    type: tenant_domain_type.SUBDOMAIN,
    is_primary: true,
    tenant: {
      id: 'tenant-1',
      slug: 'demo-spa',
      name: 'Demo Spa',
      status: tenant_status.ACTIVE,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi-VN',
      domains: [],
      settings: { settings: { brand_color: '#2563eb' } },
    },
  };
}

describe('ResolveTenantUseCase', () => {
  it('normalizes the host and returns the matched tenant/domain summary', async () => {
    const repository = {
      findDomainByHost: jest.fn().mockResolvedValue(makeDomain()),
    };

    await expect(
      new ResolveTenantUseCase(repository as any).execute(
        ' DEMO.LOCALHOST:3000 ',
      ),
    ).resolves.toEqual({
      tenant: {
        id: 'tenant-1',
        slug: 'demo-spa',
        name: 'Demo Spa',
        status: tenant_status.ACTIVE,
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi-VN',
      },
      domain: {
        id: 'domain-1',
        host: 'demo.localhost',
        type: tenant_domain_type.SUBDOMAIN,
        is_primary: true,
      },
    });

    expect(repository.findDomainByHost).toHaveBeenCalledWith('demo.localhost');
  });

  it('rejects unknown domains', async () => {
    const repository = {
      findDomainByHost: jest.fn().mockResolvedValue(null),
    };

    await expect(
      new ResolveTenantUseCase(repository as any).execute('unknown.localhost'),
    ).rejects.toThrow('Tenant domain not found');
  });
});
