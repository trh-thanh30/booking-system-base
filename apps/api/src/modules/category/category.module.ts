import { PrismaModule } from '@/database/prisma/prisma.module';
import { CategoryController } from '@/modules/category/category.controller';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { ArchiveCategoryUseCase } from '@/modules/category/use-cases/archive-category.use-case';
import { CreateCategoryUseCase } from '@/modules/category/use-cases/create-category.use-case';
import { GetCategoryUseCase } from '@/modules/category/use-cases/get-category.use-case';
import { ListCategoriesUseCase } from '@/modules/category/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/category/use-cases/update-category.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [CategoryController],
  providers: [
    CategoryRepository,
    ListCategoriesUseCase,
    GetCategoryUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    ArchiveCategoryUseCase,
  ],
  exports: [
    CategoryRepository,
    ListCategoriesUseCase,
    GetCategoryUseCase,
    CreateCategoryUseCase,
    UpdateCategoryUseCase,
    ArchiveCategoryUseCase,
  ],
})
export class CategoryModule {}
