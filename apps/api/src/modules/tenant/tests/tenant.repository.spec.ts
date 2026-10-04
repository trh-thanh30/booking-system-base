import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { business_status, tenant_status, user_role } from '@prisma/client';

describe('TenantRepository', () => {
  it.each([1, 0])(
    'conditionally attaches an existing Owner; count=%s guards replay',
    async (count) => {
      const tx = {
        tenant: {
          create: jest.fn().mockResolvedValue({
            id: 'tenant',
            businesses: [{ id: 'business', is_default: true }],
          }),
        },
        user: {
          updateMany: jest.fn().mockResolvedValue({ count }),
          findUniqueOrThrow: jest
            .fn()
            .mockResolvedValue({ id: 'owner', tenant_id: 'tenant' }),
          create: jest.fn(),
        },
        businessMembership: { create: jest.fn() },
      };
      const repository = new TenantRepository({
        $transaction: (callback: (value: typeof tx) => Promise<unknown>) =>
          callback(tx),
      } as never);
      const result = repository.createTenantWithOwner({
        tenant: {
          name: 'Demo',
          slug: 'demo',
          defaultBusinessSettings: { onboarding: { address: 'demo' } },
        },
        owner: {
          existingUserId: 'owner',
          email: 'owner@example.com',
          username: 'owner',
          password: 'hash',
        },
      });
      if (count === 1)
        await expect(result).resolves.toMatchObject({ owner: { id: 'owner' } });
      else
        await expect(result).rejects.toMatchObject({
          code: 'OWNER_ONBOARDING_ALREADY_COMPLETED',
        });
      expect(tx.user.create).not.toHaveBeenCalled();
      expect(tx.user.updateMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: 'owner',
            tenant_id: null,
            role: 'OWNER',
            status: 'ACTIVE',
            is_verified: true,
          },
        }),
      );
      if (count === 0)
        expect(tx.businessMembership.create).not.toHaveBeenCalled();
      expect(tx.tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            settings: { create: { settings: {} } },
            businesses: {
              create: expect.objectContaining({
                settings: { onboarding: { address: 'demo' } },
              }),
            },
          }),
        }),
      );
    },
  );
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
