import { CreateBusinessUseCase } from '@/modules/business/use-cases/create-business.use-case';
import { ListBusinessesUseCase } from '@/modules/business/use-cases/list-businesses.use-case';
import { business_status } from '@prisma/client';

function makeBusiness(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

describe('Business use cases', () => {
  it('lists businesses in a tenant', async () => {
    const repository = {
      listByTenant: jest.fn().mockResolvedValue([makeBusiness()]),
    };

    await expect(
      new ListBusinessesUseCase(repository as any).execute('tenant-1'),
    ).resolves.toEqual([
      expect.objectContaining({
        id: 'business-1',
        tenant_id: 'tenant-1',
        is_default: true,
      }),
    ]);

    expect(repository.listByTenant).toHaveBeenCalledWith('tenant-1');
  });

  it('creates a business when slug is unique in the tenant', async () => {
    const repository = {
      findBySlugInTenant: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue(
        makeBusiness({
          id: 'business-2',
          slug: 'branch-2',
          name: 'Branch 2',
          is_default: false,
        }),
      ),
    };

    await expect(
      new CreateBusinessUseCase(repository as any).execute('tenant-1', {
        slug: 'branch-2',
        name: 'Branch 2',
      } as any),
    ).resolves.toMatchObject({
      id: 'business-2',
      slug: 'branch-2',
      is_default: false,
    });

    expect(repository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: 'tenant-1',
        slug: 'branch-2',
        is_default: false,
      }),
    );
  });

  it('rejects duplicate business slug in the tenant', async () => {
    const repository = {
      findBySlugInTenant: jest.fn().mockResolvedValue(makeBusiness()),
    };

    await expect(
      new CreateBusinessUseCase(repository as any).execute('tenant-1', {
        slug: 'demo-spa',
        name: 'Demo Spa',
      } as any),
    ).rejects.toThrow('Business slug is already taken');
  });
});
