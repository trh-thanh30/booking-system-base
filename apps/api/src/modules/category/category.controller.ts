import {
  ApiSuccess,
  Business,
  Permissions,
  RequireBusiness,
  RequireTenant,
  Tenant,
} from '@/common/decorators';
import type { TenantContext } from '@/common/types/tenant-context.types';
import { ArchiveCategoryUseCase } from '@/modules/category/use-cases/archive-category.use-case';
import { CreateCategoryUseCase } from '@/modules/category/use-cases/create-category.use-case';
import { GetCategoryUseCase } from '@/modules/category/use-cases/get-category.use-case';
import { ListCategoriesUseCase } from '@/modules/category/use-cases/list-categories.use-case';
import { UpdateCategoryUseCase } from '@/modules/category/use-cases/update-category.use-case';
import { CreateCategoryDto } from '@/modules/category/dto/create-category.dto';
import { ListCategoriesDto } from '@/modules/category/dto/list-categories.dto';
import { UpdateCategoryDto } from '@/modules/category/dto/update-category.dto';
import { PERMISSIONS } from '@/modules/permission/constants/permission.constants';
import type { BusinessContext } from '@repo/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

@Controller('categories')
@RequireTenant()
@RequireBusiness()
export class CategoryController {
  constructor(
    private readonly listCategoriesUseCase: ListCategoriesUseCase,
    private readonly getCategoryUseCase: GetCategoryUseCase,
    private readonly createCategoryUseCase: CreateCategoryUseCase,
    private readonly updateCategoryUseCase: UpdateCategoryUseCase,
    private readonly archiveCategoryUseCase: ArchiveCategoryUseCase,
  ) {}

  @Get()
  @Permissions([PERMISSIONS.CATEGORY.READ])
  @ApiSuccess('Categories retrieved successfully')
  list(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Query() query: ListCategoriesDto,
  ) {
    return this.listCategoriesUseCase.execute(tenant.id, business.id, query);
  }

  @Post()
  @Permissions([PERMISSIONS.CATEGORY.CREATE])
  @ApiSuccess('Category created successfully')
  create(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Body() dto: CreateCategoryDto,
  ) {
    return this.createCategoryUseCase.execute(tenant.id, business.id, dto);
  }

  @Get(':id')
  @Permissions([PERMISSIONS.CATEGORY.READ])
  @ApiSuccess('Category retrieved successfully')
  get(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Param('id') id: string,
  ) {
    return this.getCategoryUseCase.execute(tenant.id, business.id, id);
  }

  @Patch(':id')
  @Permissions([PERMISSIONS.CATEGORY.UPDATE])
  @ApiSuccess('Category updated successfully')
  update(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.updateCategoryUseCase.execute(tenant.id, business.id, id, dto);
  }

  @Delete(':id')
  @Permissions([PERMISSIONS.CATEGORY.DELETE])
  @ApiSuccess('Category archived successfully')
  archive(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Param('id') id: string,
  ) {
    return this.archiveCategoryUseCase.execute(tenant.id, business.id, id);
  }
}
