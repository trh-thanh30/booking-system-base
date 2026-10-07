import { BusinessCategoryRepository } from '../repository/business-category.repository';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ListBusinessCategoriesUseCase {
  constructor(private readonly repository: BusinessCategoryRepository) {}

  execute() {
    return this.repository.listActive();
  }
}
