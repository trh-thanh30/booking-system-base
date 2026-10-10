import { BadRequestError } from '@/common/response';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { Injectable } from '@nestjs/common';
import { asset_access_type } from '@prisma/client';

@Injectable()
export class CategoryAssetValidator {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async validate(tenantId: string, assetIds: string[]) {
    if (assetIds.length === 0) return;

    if (new Set(assetIds).size !== assetIds.length) {
      throw this.invalidAssetError();
    }

    const assets = await this.categoryRepository.findAssetsByIdsInTenant(
      tenantId,
      assetIds,
    );
    const validAssets = new Set(
      assets
        .filter(
          (asset) =>
            asset.mime_type.startsWith('image/') &&
            asset.access_type === asset_access_type.PUBLIC,
        )
        .map((asset) => asset.id),
    );

    if (
      validAssets.size !== assetIds.length ||
      assetIds.some((assetId) => !validAssets.has(assetId))
    ) {
      throw this.invalidAssetError();
    }
  }

  private invalidAssetError() {
    return new BadRequestError(
      'Category assets must be public images owned by the current tenant',
      'CATEGORY_ASSET_INVALID',
    );
  }
}
