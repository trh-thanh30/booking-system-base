import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { tenant_status } from '@prisma/client';

describe('TenantRepository default Business invariant', () => {
  it('aborts the onboarding transaction when no default Business was created', async () => {
    const transaction = {
      tenant: {
        create: jest.fn().mockResolvedValue({
          id: 'tenant-1',
          slug: 'demo-spa',
          name: 'Demo Spa',
          status: tenant_status.ACTIVE,
          timezone: 'Asia/Ho_Chi_Minh',
          locale: 'vi',
          businesses: [],
          domains: [],
          settings: { settings: {} },
        }),
      },
      user: { create: jest.fn() },
      businessMembership: { create: jest.fn() },
    };
    const prisma = {
      $transaction: jest.fn(
        (callback: (client: typeof transaction) => Promise<unknown>) =>
          callback(transaction),
      ),
    };

    await expect(
      new TenantRepository(prisma as never).createTenantWithOwner({
        tenant: { slug: 'demo-spa', name: 'Demo Spa' },
        owner: {
          email: 'owner@example.com',
          username: 'owner',
          password: 'hashed-password',
        },
      }),
    ).rejects.toThrow('Default business was not created');

    expect(transaction.user.create).not.toHaveBeenCalled();
    expect(transaction.businessMembership.create).not.toHaveBeenCalled();
  });
});
