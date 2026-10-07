import { ApiSuccess } from '@/common/decorators';
import { Public } from '@/common/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { ListBusinessCategoriesUseCase } from '../use-cases/list-business-categories.use-case';

@Public()
@Controller('business-categories')
export class BusinessCategoryController {
  constructor(private readonly list: ListBusinessCategoriesUseCase) {}

  @Get()
  @ApiSuccess('Business categories retrieved successfully')
  findAll() {
    return this.list.execute();
  }
}
