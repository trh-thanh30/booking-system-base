import { ArchiveCategoryUseCase } from '@/modules/category/use-cases/archive-category.use-case';
import { CreateCategoryUseCase } from '@/modules/category/use-cases/create-category.use-case';
import { GetCategoryUseCase } from '@/modules/category/use-cases/get-category.use-case';
import { ListCategoriesUseCase } from '@/modules/category/use-cases/list-categories.use-case';
import { ReorderCategoriesUseCase } from '@/modules/category/use-cases/reorder-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/category/use-cases/update-category.use-case';
import { CategoryInputNormalizer } from '@/modules/category/utils/category-input.util';
import { CategoryAssetValidator } from '@/modules/category/utils/category-asset.util';
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

function makeAsset(overrides: Record<string, unknown> = {}) {
  return {
    id: '10000000-0000-4000-8000-000000000001',
    tenant_id: tenantId,
    mime_type: 'image/jpeg',
    access_type: 'PUBLIC',
    is_deleted: false,
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
    countNonArchivedServices: jest.fn().mockResolvedValue(0),
    countChildren: jest.fn().mockResolvedValue(0),
    countNonArchivedChildren: jest.fn().mockResolvedValue(0),
    findAssetsByIdsInTenant: jest
      .fn()
      .mockImplementation((_tenantId, assetIds: string[]) =>
        Promise.resolve(assetIds.map((id) => makeAsset({ id }))),
      ),
    findParentChain: jest.fn().mockResolvedValue([]),
    findByIdsInBusiness: jest
      .fn()
      .mockResolvedValue([
        makeCategory({ id: 'category-1', sort_order: 1 }),
        makeCategory({ id: 'category-2', sort_order: 0 }),
      ]),
    findReorderScopeInBusiness: jest
      .fn()
      .mockResolvedValue([
        makeCategory({ id: 'category-1', sort_order: 1 }),
        makeCategory({ id: 'category-2', sort_order: 0 }),
      ]),
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
    reorder: jest
      .fn()
      .mockResolvedValue([
        makeCategory({ id: 'category-2', sort_order: 0 }),
        makeCategory({ id: 'category-1', sort_order: 1 }),
      ]),
    ...overrides,
  };
}

function createCategoryUseCase(repo: ReturnType<typeof repository>) {
  return new CreateCategoryUseCase(
    repo as any,
    new CategoryInputNormalizer(),
    new CategoryParentValidator(repo as any),
    new CategoryAssetValidator(repo as any),
  );
}

function updateCategoryUseCase(repo: ReturnType<typeof repository>) {
  return new UpdateCategoryUseCase(
    repo as any,
    new CategoryInputNormalizer(),
    new CategoryParentValidator(repo as any),
    new CategoryAssetValidator(repo as any),
  );
}

describe('Category use cases', () => {
  it('lists categories in the current business and excludes archived by default', async () => {
    const repo = repository({
      list: jest.fn().mockResolvedValue({
        data: [
          makeCategory({
            _count: { children: 2, services: 3 },
            parent: {
              id: 'parent-category',
              name: 'Wellness',
              slug: 'wellness',
            },
            assets: [
              {
                id: '10000000-0000-4000-8000-000000000001',
                mime_type: 'image/jpeg',
                original_name: 'wellness.jpg',
                sort_order: 0,
                url: 'https://cdn.example.com/wellness.jpg',
              },
            ],
          }),
        ],
        total: 1,
      }),
    });

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
        children_count: 2,
        parent: {
          id: 'parent-category',
          name: 'Wellness',
          slug: 'wellness',
        },
        service_count: 3,
        assets: [
          expect.objectContaining({
            id: '10000000-0000-4000-8000-000000000001',
            sort_order: 0,
          }),
        ],
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
      [],
    );
  });

  it('creates a category with its ordered asset links', async () => {
    const repo = repository();
    const assetIds = [
      '10000000-0000-4000-8000-000000000001',
      '10000000-0000-4000-8000-000000000002',
    ];

    await createCategoryUseCase(repo).execute(tenantId, businessId, {
      type: category_type.SERVICE,
      name: 'Hair services',
      asset_ids: assetIds,
    });

    expect(repo.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Hair services' }),
      assetIds,
    );
  });

  it('rejects category assets outside the current tenant', async () => {
    const repo = repository({
      findAssetsByIdsInTenant: jest
        .fn()
        .mockResolvedValue([makeAsset({ id: 'asset-in-tenant' })]),
    });

    await expect(
      createCategoryUseCase(repo).execute(tenantId, businessId, {
        type: category_type.SERVICE,
        name: 'Hair services',
        asset_ids: [
          '10000000-0000-4000-8000-000000000001',
          '10000000-0000-4000-8000-000000000002',
        ],
      } as any),
    ).rejects.toMatchObject({
      code: 'CATEGORY_ASSET_INVALID',
      statusCode: 400,
    });

    expect(repo.create).not.toHaveBeenCalled();
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

  it('rejects a child category as parent to keep the hierarchy at two levels', async () => {
    const repo = repository({
      findByIdInBusiness: jest.fn().mockResolvedValue(
        makeCategory({
          id: 'child-category',
          parent_id: 'root-category',
        }),
      ),
    });

    await expect(
      createCategoryUseCase(repo).execute(tenantId, businessId, {
        type: category_type.SERVICE,
        name: 'Deep category',
        parent_id: 'child-category',
      } as any),
    ).rejects.toThrow('Category hierarchy supports only two levels');
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

  it('replaces category assets in the submitted order on update', async () => {
    const repo = repository();
    const assetIds = [
      '10000000-0000-4000-8000-000000000002',
      '10000000-0000-4000-8000-000000000001',
    ];

    await updateCategoryUseCase(repo).execute(
      tenantId,
      businessId,
      'category-1',
      { asset_ids: assetIds },
    );

    expect(repo.update).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'category-1',
      {},
      assetIds,
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

  it('rejects moving a parent category below another category', async () => {
    const repo = repository({
      countChildren: jest.fn().mockResolvedValue(1),
      findByIdInBusiness: jest
        .fn()
        .mockResolvedValueOnce(makeCategory({ id: 'category-1' }))
        .mockResolvedValueOnce(makeCategory({ id: 'parent-2' })),
    });

    await expect(
      updateCategoryUseCase(repo).execute(tenantId, businessId, 'category-1', {
        parent_id: 'parent-2',
      } as any),
    ).rejects.toThrow('A category with children cannot become a child');

    expect(repo.update).not.toHaveBeenCalled();
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

  it('rejects archiving a category that still contains non-archived services', async () => {
    const repo = repository({
      countNonArchivedServices: jest.fn().mockResolvedValue(2),
    });

    await expect(
      new ArchiveCategoryUseCase(repo as any).execute(
        tenantId,
        businessId,
        'category-1',
      ),
    ).rejects.toMatchObject({
      code: 'CATEGORY_HAS_SERVICES',
      statusCode: 409,
    });

    expect(repo.countNonArchivedServices).toHaveBeenCalledWith(
      tenantId,
      businessId,
      'category-1',
    );
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('rejects archiving a parent that still contains current child categories', async () => {
    const repo = repository({
      countNonArchivedChildren: jest.fn().mockResolvedValue(2),
    });

    await expect(
      new ArchiveCategoryUseCase(repo as any).execute(
        tenantId,
        businessId,
        'category-1',
      ),
    ).rejects.toMatchObject({
      code: 'CATEGORY_HAS_CHILDREN',
      statusCode: 409,
    });

    expect(repo.countNonArchivedServices).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('reorders categories inside the current business', async () => {
    const repo = repository();

    await expect(
      new ReorderCategoriesUseCase(repo as any).execute(tenantId, businessId, {
        category_ids: ['category-2', 'category-1'],
      }),
    ).resolves.toEqual([
      expect.objectContaining({ id: 'category-2', sort_order: 0 }),
      expect.objectContaining({ id: 'category-1', sort_order: 1 }),
    ]);

    expect(repo.findByIdsInBusiness).toHaveBeenCalledWith(
      tenantId,
      businessId,
      ['category-2', 'category-1'],
    );
    expect(repo.reorder).toHaveBeenCalledWith(tenantId, businessId, [
      { id: 'category-2', sort_order: 0 },
      { id: 'category-1', sort_order: 1 },
    ]);
  });

  it('rejects duplicate or incomplete category reorder payloads', async () => {
    const duplicateRepo = repository();

    await expect(
      new ReorderCategoriesUseCase(duplicateRepo as any).execute(
        tenantId,
        businessId,
        {
          category_ids: ['category-1', 'category-1'],
        },
      ),
    ).rejects.toMatchObject({
      code: 'CATEGORY_REORDER_DUPLICATE_ID',
      statusCode: 422,
    });
    expect(duplicateRepo.findByIdsInBusiness).not.toHaveBeenCalled();

    const incompleteRepo = repository({
      findReorderScopeInBusiness: jest
        .fn()
        .mockResolvedValue([
          makeCategory({ id: 'category-1' }),
          makeCategory({ id: 'category-2' }),
          makeCategory({ id: 'category-3' }),
        ]),
    });

    await expect(
      new ReorderCategoriesUseCase(incompleteRepo as any).execute(
        tenantId,
        businessId,
        {
          category_ids: ['category-2', 'category-1'],
        },
      ),
    ).rejects.toMatchObject({
      code: 'CATEGORY_REORDER_INCOMPLETE',
      statusCode: 422,
    });
    expect(incompleteRepo.reorder).not.toHaveBeenCalled();
  });
});
