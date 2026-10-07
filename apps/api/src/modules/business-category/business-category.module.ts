import { PrismaModule } from '@/database/prisma/prisma.module';
import { Module } from '@nestjs/common';
import { BusinessCategoryController } from './controllers/business-category.controller';
import { BusinessCategoryRepository } from './repository/business-category.repository';
import { ListBusinessCategoriesUseCase } from './use-cases/list-business-categories.use-case';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessCategoryController],
  providers: [BusinessCategoryRepository, ListBusinessCategoriesUseCase],
  exports: [BusinessCategoryRepository],
})
export class BusinessCategoryModule {}
