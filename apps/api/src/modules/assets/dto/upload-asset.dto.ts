import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import type { UploadAssetInput } from '@repo/shared';

export enum AssetAccessTypeDto {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
  TEMP = 'TEMP',
}

export class UploadAssetDto implements UploadAssetInput {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  folder?: string;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  entityType?: string;

  @IsOptional()
  @IsEnum(AssetAccessTypeDto)
  accessType?: UploadAssetInput['accessType'];

  @IsOptional()
  @IsString()
  @MaxLength(20)
  type?: string;
}
