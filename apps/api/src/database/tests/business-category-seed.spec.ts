import {
  business_category_status,
  type BusinessCategory,
  type Prisma,
} from '@prisma/client';
import {
  BUSINESS_CATEGORY_SEEDS,
  seedBusinessCategories,
} from '../../../prisma/seeds/business-categories.seed';

describe('BusinessCategory seed', () => {
  it('defines a unique, ordered bilingual platform taxonomy', () => {
    expect(BUSINESS_CATEGORY_SEEDS).toHaveLength(12);
    expect(
      new Set(BUSINESS_CATEGORY_SEEDS.map((category) => category.slug)).size,
    ).toBe(BUSINESS_CATEGORY_SEEDS.length);
    expect(
      BUSINESS_CATEGORY_SEEDS.every(
        (category) => category.name_vi && category.name_en,
      ),
    ).toBe(true);
    expect(BUSINESS_CATEGORY_SEEDS.at(-1)?.slug).toBe('other');
  });

  it('upserts every category by stable slug without overwriting managed data', async () => {
    const upsert = jest.fn(({ create }: Prisma.BusinessCategoryUpsertArgs) =>
      Promise.resolve({
        id: create.slug,
        slug: create.slug,
        name_vi: create.name_vi,
        name_en: create.name_en,
        status: create.status ?? business_category_status.ACTIVE,
        sort_order: create.sort_order ?? 0,
        metadata: null,
        created_at: new Date(),
        updated_at: new Date(),
      } satisfies BusinessCategory),
    );
    const prisma = {
      businessCategory: { upsert },
    };

    const result = await seedBusinessCategories(prisma);

    expect(result).toHaveLength(BUSINESS_CATEGORY_SEEDS.length);
    expect(upsert).toHaveBeenCalledTimes(BUSINESS_CATEGORY_SEEDS.length);
    expect(upsert).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        where: { slug: 'spa' },
        update: {},
      }),
    );
  });
});
