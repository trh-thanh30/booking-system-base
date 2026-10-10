import { CategoryModule } from '@/modules/category/category.module';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { ServiceModule } from '@/modules/service/service.module';
import { MODULE_METADATA } from '@nestjs/common/constants';

jest.mock('@/modules/category/category.controller', () => ({
  CategoryController: class CategoryController {},
}));
jest.mock('@/modules/service/service.controller', () => ({
  ServiceController: class ServiceController {},
}));

describe('ServiceModule wiring', () => {
  it('uses the CategoryRepository exported by CategoryModule', () => {
    const importsMetadata: unknown = Reflect.getMetadata(
      MODULE_METADATA.IMPORTS,
      ServiceModule,
    );
    const providersMetadata: unknown = Reflect.getMetadata(
      MODULE_METADATA.PROVIDERS,
      ServiceModule,
    );
    const imports = Array.isArray(importsMetadata) ? importsMetadata : [];
    const providers = Array.isArray(providersMetadata) ? providersMetadata : [];

    expect(imports).toContain(CategoryModule);
    expect(providers).not.toContain(CategoryRepository);
  });
});
