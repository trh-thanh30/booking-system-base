import { ListBusinessCategoriesUseCase } from '../use-cases/list-business-categories.use-case';

describe('ListBusinessCategoriesUseCase', () => {
  it('returns the active categories supplied by the repository', async () => {
    const categories = [
      {
        id: 'category-id',
        slug: 'spa',
        name_vi: 'Spa và chăm sóc sức khỏe',
        name_en: 'Spa & Wellness',
        metadata: null,
      },
    ];
    const repository = {
      listActive: jest.fn().mockResolvedValue(categories),
    };
    const useCase = new ListBusinessCategoriesUseCase(repository as never);

    await expect(useCase.execute()).resolves.toEqual(categories);
    expect(repository.listActive).toHaveBeenCalledTimes(1);
  });
});
