import { CheckOwnerBusinessSlugUseCase } from '@/modules/auth/use-cases/check-owner-business-slug.usecase';

describe('CheckOwnerBusinessSlugUseCase', () => {
  it('returns available when no tenant owns the slug', async () => {
    const tenants = { findBySlug: jest.fn().mockResolvedValue(null) };

    await expect(
      new CheckOwnerBusinessSlugUseCase(tenants as never).execute('lotus-spa'),
    ).resolves.toEqual({ slug: 'lotus-spa', available: true });
    expect(tenants.findBySlug).toHaveBeenCalledWith('lotus-spa');
  });

  it('returns unavailable when the slug is already used', async () => {
    const tenants = {
      findBySlug: jest.fn().mockResolvedValue({ id: 'tenant-1' }),
    };

    await expect(
      new CheckOwnerBusinessSlugUseCase(tenants as never).execute('lotus-spa'),
    ).resolves.toEqual({ slug: 'lotus-spa', available: false });
  });
});
