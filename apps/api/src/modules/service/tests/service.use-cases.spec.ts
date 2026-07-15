import { ArchiveServiceUseCase } from '@/modules/service/use-cases/archive-service.use-case';
import { CreateServiceUseCase } from '@/modules/service/use-cases/create-service.use-case';
import { GetServiceUseCase } from '@/modules/service/use-cases/get-service.use-case';
import { ListServicesUseCase } from '@/modules/service/use-cases/list-services.use-case';
import { UpdateServiceUseCase } from '@/modules/service/use-cases/update-service.use-case';
import { category_status, category_type, service_status } from '@prisma/client';

const tenantId = 'tenant-1';
const businessId = 'business-1';

function makeCategory(overrides: Record<string, unknown> = {}) {
  return {
    id: 'category-1',
    tenant_id: tenantId,
    business_id: businessId,
    type: category_type.SERVICE,
    name: 'Massage',
    slug: 'massage',
    description: null,
    status: category_status.ACTIVE,
    sort_order: 0,
    parent_id: null,
    metadata: {},
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

function makeService(overrides: Record<string, unknown> = {}) {
  return {
    id: 'service-1',
    tenant_id: tenantId,
    business_id: businessId,
    category_id: 'category-1',
    name: 'Deep Tissue Massage',
    slug: 'deep-tissue-massage',
    description: null,
    duration_minutes: 60,
    buffer_before_minutes: 0,
    buffer_after_minutes: 10,
    price_amount: 500000,
    currency: 'VND',
    status: service_status.ACTIVE,
    sort_order: 0,
    category: makeCategory(),
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

function serviceRepository(overrides: Record<string, unknown> = {}) {
  return {
    list: jest.fn().mockResolvedValue({
      data: [makeService()],
      total: 1,
    }),
    findByIdInBusiness: jest.fn().mockResolvedValue(makeService()),
    findBySlugInBusiness: jest.fn().mockResolvedValue(null),
    findBySlugInBusinessExcludingId: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockImplementation((data) =>
      Promise.resolve(
        makeService({
          id: 'service-created',
          ...data,
          category: data.category_id
            ? makeCategory({ id: data.category_id })
            : null,
        }),
      ),
    ),
    update: jest.fn().mockImplementation((_tenantId, _businessId, _id, data) =>
      Promise.resolve(
        makeService({
          ...data,
          updated_at: new Date('2026-01-03T00:00:00.000Z'),
        }),
      ),
    ),
    ...overrides,
  };
}

function categoryRepository(overrides: Record<string, unknown> = {}) {
  return {
    findByIdInBusiness: jest.fn().mockResolvedValue(makeCategory()),
    ...overrides,
  };
}

describe('Service use cases', () => {
  it('lists services in the current business and excludes archived by default', async () => {
    const repo = serviceRepository();

    const result = await new ListServicesUseCase(repo as any).execute(
      tenantId,
      businessId,
      {
        page: 1,
        limit: 50,
      },
    );

    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        businessId,
        includeArchived: undefined,
      }),
    );
    expect(result.data).toEqual([
      expect.objectContaining({
        id: 'service-1',
        business_id: businessId,
        category: expect.objectContaining({ type: category_type.SERVICE }),
      }),
    ]);
  });

  it('gets a service only inside the current business', async () => {
    const repo = serviceRepository();

    await expect(
      new GetServiceUseCase(repo as any).execute(
        tenantId,
        businessId,
        'service-1',
      ),
    ).resolves.toMatchObject({
      id: 'service-1',
    });

    expect(repo.findByIdInBusiness).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'service-1',
    );
  });

  it('creates a service with normalized name, slug, currency, and category validation', async () => {
    const repo = serviceRepository();
    const categories = categoryRepository();

    await expect(
      new CreateServiceUseCase(repo as any, categories as any).execute(
        tenantId,
        businessId,
        {
          category_id: 'category-1',
          name: '  Deep Tissue Massage ',
          duration_minutes: 60,
          buffer_after_minutes: 10,
          price_amount: 500000,
          currency: 'vnd',
        } as any,
      ),
    ).resolves.toMatchObject({
      id: 'service-created',
      name: 'Deep Tissue Massage',
      slug: 'deep-tissue-massage',
      currency: 'VND',
    });

    expect(categories.findByIdInBusiness).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'category-1',
    );
    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: tenantId,
        business_id: businessId,
        category_id: 'category-1',
        slug: 'deep-tissue-massage',
        currency: 'VND',
      }),
    );
  });

  it('rejects duplicate service slug in the same business', async () => {
    const repo = serviceRepository({
      findBySlugInBusiness: jest.fn().mockResolvedValue(makeService()),
    });

    await expect(
      new CreateServiceUseCase(
        repo as any,
        categoryRepository() as any,
      ).execute(tenantId, businessId, {
        name: 'Deep Tissue Massage',
        duration_minutes: 60,
        price_amount: 500000,
      } as any),
    ).rejects.toThrow('Service slug is already taken');

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejects non-service and archived categories', async () => {
    await expect(
      new CreateServiceUseCase(
        serviceRepository() as any,
        categoryRepository({
          findByIdInBusiness: jest
            .fn()
            .mockResolvedValue(makeCategory({ type: category_type.PRODUCT })),
        }) as any,
      ).execute(tenantId, businessId, {
        category_id: 'category-1',
        name: 'Massage',
        duration_minutes: 60,
        price_amount: 500000,
      } as any),
    ).rejects.toThrow('Category must be a SERVICE category');

    await expect(
      new CreateServiceUseCase(
        serviceRepository() as any,
        categoryRepository({
          findByIdInBusiness: jest.fn().mockResolvedValue(
            makeCategory({
              status: category_status.ARCHIVED,
            }),
          ),
        }) as any,
      ).execute(tenantId, businessId, {
        category_id: 'category-1',
        name: 'Massage',
        duration_minutes: 60,
        price_amount: 500000,
      } as any),
    ).rejects.toThrow('Service category is archived');
  });

  it('updates a service and rejects duplicate slug changes', async () => {
    const repo = serviceRepository({
      findBySlugInBusinessExcludingId: jest
        .fn()
        .mockResolvedValueOnce(makeService({ id: 'service-2' }))
        .mockResolvedValueOnce(null),
    });
    const useCase = new UpdateServiceUseCase(
      repo as any,
      categoryRepository() as any,
    );

    await expect(
      useCase.execute(tenantId, businessId, 'service-1', {
        slug: 'existing',
      } as any),
    ).rejects.toThrow('Service slug is already taken');

    await expect(
      useCase.execute(tenantId, businessId, 'service-1', {
        name: '  Swedish Massage ',
        slug: 'Swedish Massage',
        category_id: null,
        currency: 'usd',
      } as any),
    ).resolves.toMatchObject({
      name: 'Swedish Massage',
      slug: 'swedish-massage',
      category_id: null,
      currency: 'USD',
    });

    expect(repo.update).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'service-1',
      expect.objectContaining({
        name: 'Swedish Massage',
        slug: 'swedish-massage',
        category_id: null,
        currency: 'USD',
      }),
    );
  });

  it('archives services with idempotent behavior', async () => {
    const repo = serviceRepository();

    await expect(
      new ArchiveServiceUseCase(repo as any).execute(
        tenantId,
        businessId,
        'service-1',
      ),
    ).resolves.toMatchObject({
      status: service_status.ARCHIVED,
    });

    expect(repo.update).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'service-1',
      {
        status: service_status.ARCHIVED,
      },
    );

    await expect(
      new ArchiveServiceUseCase(
        serviceRepository({
          findByIdInBusiness: jest.fn().mockResolvedValue(
            makeService({
              status: service_status.ARCHIVED,
            }),
          ),
        }) as any,
      ).execute(tenantId, businessId, 'service-1'),
    ).resolves.toMatchObject({
      status: service_status.ARCHIVED,
    });
  });
});
