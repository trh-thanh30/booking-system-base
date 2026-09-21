import { ArchiveCategoryUseCase } from '@/modules/category/use-cases/archive-category.use-case';
import { CreateCategoryUseCase } from '@/modules/category/use-cases/create-category.use-case';
import { GetCategoryUseCase } from '@/modules/category/use-cases/get-category.use-case';
import { ListCategoriesUseCase } from '@/modules/category/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/category/use-cases/update-category.use-case';
import { CategoryInputNormalizer } from '@/modules/category/utils/category-input.util';
import { CategoryParentValidator } from '@/modules/category/utils/category-parent.util';
import { category_status, category_type } from '@prisma/client';

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

function repository(overrides: Record<string, unknown> = {}) {
  return {
    list: jest.fn().mockResolvedValue({
      data: [makeCategory()],
      total: 1,
    }),
    findByIdInBusiness: jest.fn().mockResolvedValue(makeCategory()),
    findBySlugInBusiness: jest.fn().mockResolvedValue(null),
    findBySlugInBusinessExcludingId: jest.fn().mockResolvedValue(null),
    findParentChain: jest.fn().mockResolvedValue([]),
    create: jest.fn().mockImplementation((data) =>
      Promise.resolve(
        makeCategory({
          id: 'category-created',
          ...data,
        }),
      ),
    ),
    update: jest.fn().mockImplementation((_tenantId, _businessId, _id, data) =>
      Promise.resolve(
        makeCategory({
          ...data,
          updated_at: new Date('2026-01-03T00:00:00.000Z'),
        }),
      ),
    ),
    ...overrides,
  };
}

function createCategoryUseCase(repo: ReturnType<typeof repository>) {
  return new CreateCategoryUseCase(
    repo as any,
    new CategoryInputNormalizer(),
    new CategoryParentValidator(repo as any),
  );
}

function updateCategoryUseCase(repo: ReturnType<typeof repository>) {
  return new UpdateCategoryUseCase(
    repo as any,
    new CategoryInputNormalizer(),
    new CategoryParentValidator(repo as any),
  );
}

describe('Category use cases', () => {
  it('lists categories in the current business and excludes archived by default', async () => {
    const repo = repository();

    const result = await new ListCategoriesUseCase(repo as any).execute(
      tenantId,
      businessId,
      {
        page: 1,
        limit: 50,
        type: category_type.SERVICE,
      },
    );

    expect(repo.list).toHaveBeenCalledWith(
      expect.objectContaining({
        tenantId,
        businessId,
        type: category_type.SERVICE,
        includeArchived: undefined,
      }),
    );
    expect(result.data).toEqual([
      expect.objectContaining({
        id: 'category-1',
        business_id: businessId,
      }),
    ]);
  });

  it('gets a category only inside the current business', async () => {
    const repo = repository();

    await expect(
      new GetCategoryUseCase(repo as any).execute(
        tenantId,
        businessId,
        'category-1',
      ),
    ).resolves.toMatchObject({
      id: 'category-1',
    });

    expect(repo.findByIdInBusiness).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'category-1',
    );
  });

  it('creates a category with normalized name and generated slug', async () => {
    const repo = repository();

    await expect(
      createCategoryUseCase(repo).execute(tenantId, businessId, {
        type: category_type.SERVICE,
        name: '  Spa Services  ',
      } as any),
    ).resolves.toMatchObject({
      id: 'category-created',
      name: 'Spa Services',
      slug: 'spa-services',
      status: category_status.ACTIVE,
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: tenantId,
        business_id: businessId,
        type: category_type.SERVICE,
        name: 'Spa Services',
        slug: 'spa-services',
      }),
    );
  });

  it('rejects duplicate slugs inside the same business and type', async () => {
    const repo = repository({
      findBySlugInBusiness: jest.fn().mockResolvedValue(makeCategory()),
    });

    await expect(
      createCategoryUseCase(repo).execute(tenantId, businessId, {
        type: category_type.SERVICE,
        name: 'Massage',
      } as any),
    ).rejects.toThrow('Category slug is already taken');

    expect(repo.create).not.toHaveBeenCalled();
  });

  it('rejects archived or mismatched parent categories', async () => {
    await expect(
      createCategoryUseCase(
        repository({
          findByIdInBusiness: jest
            .fn()
            .mockResolvedValue(makeCategory({ type: category_type.PRODUCT })),
        }),
      ).execute(tenantId, businessId, {
        type: category_type.SERVICE,
        name: 'Massage',
        parent_id: 'parent-1',
      } as any),
    ).rejects.toThrow('Parent category must have the same type');

    await expect(
      createCategoryUseCase(
        repository({
          findByIdInBusiness: jest.fn().mockResolvedValue(
            makeCategory({
              status: category_status.ARCHIVED,
            }),
          ),
        }),
      ).execute(tenantId, businessId, {
        type: category_type.SERVICE,
        name: 'Massage',
        parent_id: 'parent-1',
      } as any),
    ).rejects.toThrow('Parent category is archived');
  });

  it('updates a category and rejects duplicate slug changes', async () => {
    const repo = repository({
      findBySlugInBusinessExcludingId: jest
        .fn()
        .mockResolvedValueOnce(makeCategory({ id: 'category-2' }))
        .mockResolvedValueOnce(null),
    });
    const useCase = updateCategoryUseCase(repo);

    await expect(
      useCase.execute(tenantId, businessId, 'category-1', {
        slug: 'existing',
      } as any),
    ).rejects.toThrow('Category slug is already taken');

    await expect(
      useCase.execute(tenantId, businessId, 'category-1', {
        name: '  Body Care ',
        slug: 'Body Care',
        parent_id: null,
      } as any),
    ).resolves.toMatchObject({
      name: 'Body Care',
      slug: 'body-care',
    });

    expect(repo.update).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'category-1',
      expect.objectContaining({
        name: 'Body Care',
        slug: 'body-care',
        parent_id: null,
      }),
    );
  });

  it('rejects parent self-reference and cycles on update', async () => {
    await expect(
      updateCategoryUseCase(repository()).execute(
        tenantId,
        businessId,
        'category-1',
        {
          parent_id: 'category-1',
        } as any,
      ),
    ).rejects.toThrow('Category cannot be its own parent');

    await expect(
      updateCategoryUseCase(
        repository({
          findByIdInBusiness: jest
            .fn()
            .mockResolvedValueOnce(makeCategory())
            .mockResolvedValueOnce(makeCategory({ id: 'parent-1' })),
          findParentChain: jest.fn().mockResolvedValue([
            { id: 'parent-1', parent_id: 'category-1' },
            { id: 'category-1', parent_id: null },
          ]),
        }),
      ).execute(tenantId, businessId, 'category-1', {
        parent_id: 'parent-1',
      } as any),
    ).rejects.toThrow('Category parent would create a cycle');
  });

  it('archives categories with idempotent behavior', async () => {
    const repo = repository();

    await expect(
      new ArchiveCategoryUseCase(repo as any).execute(
        tenantId,
        businessId,
        'category-1',
      ),
    ).resolves.toMatchObject({
      status: category_status.ARCHIVED,
    });

    expect(repo.update).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'category-1',
      { status: category_status.ARCHIVED },
    );

    await expect(
      new ArchiveCategoryUseCase(
        repository({
          findByIdInBusiness: jest.fn().mockResolvedValue(
            makeCategory({
              status: category_status.ARCHIVED,
            }),
          ),
        }) as any,
      ).execute(tenantId, businessId, 'category-1'),
    ).resolves.toMatchObject({
      status: category_status.ARCHIVED,
    });
  });
});
