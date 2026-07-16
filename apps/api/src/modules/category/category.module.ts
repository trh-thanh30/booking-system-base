import { PrismaModule } from '@/database/prisma/prisma.module';
import { CategoryController } from '@/modules/category/category.controller';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { ArchiveCategoryUseCase } from '@/modules/category/use-cases/archive-category.use-case';
import { CreateCategoryUseCase } from '@/modules/category/use-cases/create-category.use-case';
import { GetCategoryUseCase } from '@/modules/category/use-cases/get-category.use-case';
import { ListCategoriesUseCase } from '@/modules/category/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/category/use-cases/update-category.use-case';
import { CategoryInputNormalizer } from '@/modules/category/utils/category-input.util';
import { CategoryParentValidator } from '@/modules/category/utils/category-parent.util';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [
    CategoryRepository,
    CategoryInputNormalizer,
    CategoryParentValidator,
    ListCategoriesUseCase,
    GetCategoryUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    ArchiveCategoryUseCase,
  ],
  exports: [
    CategoryRepository,
    CategoryInputNormalizer,
    CategoryParentValidator,
    ListCategoriesUseCase,
    GetCategoryUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    ArchiveCategoryUseCase,
  ],
})
export class CategoryModule {}
