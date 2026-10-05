import { CreateTenantWorkspaceUseCase } from '@/modules/tenant/use-cases/create-tenant-workspace.use-case';
import {
  business_status,
  tenant_status,
  user_role,
  user_status,
} from '@prisma/client';

describe('CreateTenantWorkspaceUseCase', () => {
  it('creates a tenant, default business and Owner membership workspace', async () => {
    const repository = makeRepository();

    await expect(
      new CreateTenantWorkspaceUseCase(repository as never).execute({
        tenant: {
          slug: 'demo-spa',
          name: 'Demo Spa',
          primaryDomain: ' DEMO.LOCALHOST:3000 ',
        },
        owner: {
          email: 'owner@example.com',
          username: 'owner',
          password: 'hashed-password',
        },
      }),
    ).resolves.toMatchObject({
      tenant: { id: 'tenant-1' },
      business: { id: 'business-1', is_default: true },
      owner: { id: 'owner-1', role: user_role.OWNER },
    });

    expect(repository.findDomainByHost).toHaveBeenCalledWith('demo.localhost');
    expect(repository.createTenantWithOwner).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant: expect.objectContaining({ primaryDomain: 'demo.localhost' }),
      }),
    );
  });

  it('rejects a duplicate tenant slug before provisioning', async () => {
    const repository = makeRepository({
      findBySlug: jest.fn().mockResolvedValue({ id: 'tenant-1' }),
    });

    await expect(
      new CreateTenantWorkspaceUseCase(repository as never).execute({
        tenant: { slug: 'demo-spa', name: 'Demo Spa' },
        owner: {
          email: 'owner@example.com',
          username: 'owner',
          password: 'hashed-password',
        },
      }),
    ).rejects.toThrow('Tenant slug is already taken');
    expect(repository.createTenantWithOwner).not.toHaveBeenCalled();
  });
});

function makeRepository(overrides: { findBySlug?: jest.Mock } = {}) {
  const createdAt = new Date('2026-09-30T00:00:00.000Z');
  const business = {
    id: 'business-1',
    tenant_id: 'tenant-1',
    slug: 'demo-spa',
    name: 'Demo Spa',
    status: business_status.ACTIVE,
    timezone: 'Asia/Ho_Chi_Minh',
    locale: 'vi',
    settings: {},
    is_default: true,
    created_at: createdAt,
    updated_at: createdAt,
  };

  return {
    findBySlug: jest.fn().mockResolvedValue(null),
    findDomainByHost: jest.fn().mockResolvedValue(null),
    createTenantWithOwner: jest.fn().mockResolvedValue({
      tenant: {
        id: 'tenant-1',
        slug: 'demo-spa',
        name: 'Demo Spa',
        status: tenant_status.ACTIVE,
        timezone: 'Asia/Ho_Chi_Minh',
        locale: 'vi',
        created_at: createdAt,
        updated_at: createdAt,
        businesses: [business],
        domains: [],
        settings: { settings: {} },
      },
      business,
      owner: {
        id: 'owner-1',
        tenant_id: 'tenant-1',
        email: 'owner@example.com',
        username: 'owner',
        full_name: null,
        role: user_role.OWNER,
        status: user_status.ACTIVE,
        is_verified: false,
      },
    }),
    ...overrides,
  };
}
