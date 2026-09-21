import { asset_access_type, asset_type } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import type { ListAssetsQuery } from '@repo/shared';

export class ListAssetsDto implements ListAssetsQuery {
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsUUID()
  uploadedById?: string;

  @IsOptional()
  @IsEnum(asset_type)
  type?: asset_type;

  @IsOptional()
  @IsEnum(asset_access_type)
  accessType?: asset_access_type;

  @IsOptional()
  @IsString()
  folder?: string;
}
