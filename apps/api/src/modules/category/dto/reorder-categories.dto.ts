import type { ReorderCategoriesInput } from '@repo/shared';
import { ArrayMaxSize, ArrayMinSize, IsArray, IsUUID } from 'class-validator';

export class ReorderCategoriesDto implements ReorderCategoriesInput {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  category_ids!: string[];
}
