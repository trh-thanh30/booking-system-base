import {
  business_category_status,
  type BusinessCategory,
  type Prisma,
} from '@prisma/client';

export type BusinessCategorySeedClient = {
  businessCategory: {
    upsert(input: Prisma.BusinessCategoryUpsertArgs): Promise<BusinessCategory>;
  };
};

export const BUSINESS_CATEGORY_SEEDS = [
  { slug: 'spa', name_vi: 'Spa', name_en: 'Spa', sort_order: 10 },
  {
    slug: 'hair-salon',
    name_vi: 'Salon tóc',
    name_en: 'Hair Salon',
    sort_order: 20,
  },
  {
    slug: 'nail-salon',
    name_vi: 'Tiệm làm móng',
    name_en: 'Nail Salon',
    sort_order: 30,
  },
  {
    slug: 'barber',
    name_vi: 'Tiệm cắt tóc nam',
    name_en: 'Barber',
    sort_order: 40,
  },
  {
    slug: 'massage',
    name_vi: 'Massage',
    name_en: 'Massage',
    sort_order: 50,
  },
  {
    slug: 'clinic',
    name_vi: 'Phòng khám',
    name_en: 'Clinic',
    sort_order: 60,
  },
  {
    slug: 'tattoo',
    name_vi: 'Xăm nghệ thuật',
    name_en: 'Tattoo',
    sort_order: 70,
  },
  {
    slug: 'fitness-yoga',
    name_vi: 'Thể hình & Yoga',
    name_en: 'Fitness & Yoga',
    sort_order: 80,
  },
  {
    slug: 'consulting',
    name_vi: 'Tư vấn',
    name_en: 'Consulting',
    sort_order: 90,
  },
  {
    slug: 'education',
    name_vi: 'Giáo dục',
    name_en: 'Education',
    sort_order: 100,
  },
  {
    slug: 'home-services',
    name_vi: 'Dịch vụ tại nhà',
    name_en: 'Home Services',
    sort_order: 110,
  },
  {
    slug: 'other',
    name_vi: 'Khác',
    name_en: 'Other',
    sort_order: 120,
  },
] as const satisfies readonly Omit<
  Prisma.BusinessCategoryCreateInput,
  'businesses'
>[];

export async function seedBusinessCategories(
  prisma: BusinessCategorySeedClient,
) {
  const categories: BusinessCategory[] = [];

  for (const category of BUSINESS_CATEGORY_SEEDS) {
    categories.push(
      await prisma.businessCategory.upsert({
        where: { slug: category.slug },
        update: {},
        create: {
          ...category,
          status: business_category_status.ACTIVE,
        },
      }),
    );
  }

  return categories;
}
