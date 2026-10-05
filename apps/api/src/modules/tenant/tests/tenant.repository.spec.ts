import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { business_status, tenant_status, user_role } from '@prisma/client';

describe('TenantRepository', () => {
  it('creates the unverified Owner, default Business and membership in one transaction', async () => {
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
      created_at: new Date(),
      updated_at: new Date(),
    };
    const transaction = {
      tenant: {
        create: jest.fn().mockResolvedValue({
          id: 'tenant-1',
          slug: 'demo-spa',
          name: 'Demo Spa',
          status: tenant_status.ACTIVE,
          timezone: 'Asia/Ho_Chi_Minh',
          locale: 'vi',
          businesses: [business],
          domains: [],
          settings: { settings: {} },
        }),
      },
      user: {
        create: jest.fn().mockResolvedValue({
          id: 'owner-1',
          tenant_id: 'tenant-1',
          role: user_role.OWNER,
        }),
      },
      businessMembership: {
        create: jest.fn().mockResolvedValue({ id: 'membership-1' }),
      },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (client: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    };

    await new TenantRepository(prisma as never).createTenantWithOwner({
      tenant: { slug: 'demo-spa', name: 'Demo Spa' },
      owner: {
        email: 'owner@example.com',
        username: 'owner',
        password: 'hashed-password',
      },
    });

    expect(transaction.tenant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          businesses: {
            create: expect.objectContaining({ is_default: true }),
          },
        }),
      }),
    );
    expect(transaction.user.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        is_verified: false,
        role: user_role.OWNER,
        tenant_id: 'tenant-1',
      }),
    });
    expect(transaction.businessMembership.create).toHaveBeenCalledWith({
      data: {
        business_id: 'business-1',
        tenant_id: 'tenant-1',
        user_id: 'owner-1',
      },
    });
  });
});
