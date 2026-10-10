import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { category_status, category_type } from '@prisma/client';

const tenantId = '10000000-0000-4000-8000-000000000001';
const businessId = '20000000-0000-4000-8000-000000000001';
const categoryId = '30000000-0000-4000-8000-000000000001';

describe('CategoryRepository', () => {
  it('creates ordered asset links in the same transaction and returns hydrated assets', async () => {
    const now = new Date('2026-10-09T00:00:00.000Z');
    const category = {
      id: categoryId,
      tenant_id: tenantId,
      business_id: businessId,
      type: category_type.SERVICE,
      name: 'Hair',
      slug: 'hair',
      description: null,
      status: category_status.ACTIVE,
      sort_order: 0,
      parent_id: null,
      metadata: {},
      created_at: now,
      updated_at: now,
      parent: null,
      _count: { children: 0, services: 0 },
    };
    const assetIds = [
      '40000000-0000-4000-8000-000000000002',
      '40000000-0000-4000-8000-000000000001',
    ];
    const transaction = {
      category: { create: jest.fn().mockResolvedValue(category) },
      assetLink: { createMany: jest.fn().mockResolvedValue({ count: 2 }) },
    };
    const prisma = {
      $transaction: jest
        .fn()
        .mockImplementation((callback) => callback(transaction)),
      category: { findFirst: jest.fn().mockResolvedValue(category) },
      assetLink: {
        findMany: jest.fn().mockResolvedValue(
          assetIds.map((assetId, sortOrder) => ({
            entity_id: categoryId,
            sort_order: sortOrder,
            created_at: now,
            asset: {
              id: assetId,
              original_name: `image-${sortOrder}.jpg`,
              mime_type: 'image/jpeg',
            },
          })),
        ),
      },
    };
    const assetsService = {
      enrichAssetUrl: jest.fn().mockImplementation((asset) => ({
        ...asset,
        url: `https://cdn.test/${asset.id}`,
      })),
    };
    const repository = new CategoryRepository(
      prisma as never,
      assetsService as never,
    );

    const result = await repository.create(
      {
        tenant_id: tenantId,
        business_id: businessId,
        type: category_type.SERVICE,
        name: 'Hair',
        slug: 'hair',
      },
      assetIds,
    );

    expect(transaction.assetLink.createMany).toHaveBeenCalledWith({
      data: [
        expect.objectContaining({ asset_id: assetIds[0], sort_order: 0 }),
        expect.objectContaining({ asset_id: assetIds[1], sort_order: 1 }),
      ],
    });
    expect(result.assets.map((asset) => asset.id)).toEqual(assetIds);
  });
});
