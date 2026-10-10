import { AssetsService } from '@/modules/assets/assets.service';
import { asset_access_type, asset_type } from '@prisma/client';

jest.mock('@/modules/assets/services/upload-asset.service', () => ({
  UploadAssetService: class UploadAssetService {},
}));

describe('AssetsService', () => {
  it('stores the uploader tenant on a newly uploaded asset', async () => {
    const createdAt = new Date('2026-10-09T00:00:00.000Z');
    const prisma = {
      asset: {
        create: jest.fn().mockImplementation(({ data }) =>
          Promise.resolve({
            id: '10000000-0000-4000-8000-000000000001',
            ...data,
            access_type: data.access_type ?? asset_access_type.PUBLIC,
            type: data.type ?? asset_type.OTHER,
            is_deleted: false,
            created_at: createdAt,
            updated_at: createdAt,
          }),
        ),
      },
    };
    const uploadAssetService = {
      upload: jest.fn().mockResolvedValue({
        originalName: 'category.jpg',
        filename: 'stored-category.jpg',
        mimeType: 'image/jpeg',
        size: 512,
        path: 'public/categories/stored-category.jpg',
        type: asset_type.IMAGE,
      }),
      getFullUrl: jest.fn().mockReturnValue('https://cdn.test/category.jpg'),
    };
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await service.uploadFile(
      {
        id: '20000000-0000-4000-8000-000000000001',
        tenant_id: '30000000-0000-4000-8000-000000000001',
      } as never,
      {
        originalname: 'category.jpg',
        mimetype: 'image/jpeg',
      } as Express.Multer.File,
      {
        folder: 'categories',
        accessType: asset_access_type.PUBLIC,
      },
    );

    expect(prisma.asset.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        tenant_id: '30000000-0000-4000-8000-000000000001',
        uploaded_by_id: '20000000-0000-4000-8000-000000000001',
      }),
    });
  });

  it('hard-deletes an owned asset from storage and the database', async () => {
    const asset = {
      id: '10000000-0000-4000-8000-000000000001',
      tenant_id: '30000000-0000-4000-8000-000000000001',
      uploaded_by_id: '20000000-0000-4000-8000-000000000001',
      path: 'public/category-descriptions/image.png',
      is_deleted: false,
    };
    const prisma = {
      asset: {
        delete: jest.fn().mockResolvedValue(asset),
        findUnique: jest.fn().mockResolvedValue(asset),
        update: jest.fn(),
      },
    };
    const uploadAssetService = {
      delete: jest.fn().mockResolvedValue(undefined),
    };
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await service.deleteAsset(asset.id, {
      id: asset.uploaded_by_id,
      tenant_id: asset.tenant_id,
      role: 'OWNER',
    } as never);

    expect(uploadAssetService.delete).toHaveBeenCalledWith(asset.path);
    expect(prisma.asset.delete).toHaveBeenCalledWith({
      where: { id: asset.id },
    });
    expect(prisma.asset.update).not.toHaveBeenCalled();
  });

  it('does not allow an owner to delete an asset from another tenant', async () => {
    const asset = {
      id: '10000000-0000-4000-8000-000000000001',
      tenant_id: '30000000-0000-4000-8000-000000000001',
      uploaded_by_id: '20000000-0000-4000-8000-000000000001',
      path: 'public/category-descriptions/image.png',
      is_deleted: false,
    };
    const prisma = {
      asset: {
        delete: jest.fn(),
        findUnique: jest.fn().mockResolvedValue(asset),
      },
    };
    const uploadAssetService = {
      delete: jest.fn(),
    };
    const service = new AssetsService(
      prisma as never,
      uploadAssetService as never,
    );

    await expect(
      service.deleteAsset(asset.id, {
        id: '20000000-0000-4000-8000-000000000002',
        tenant_id: '30000000-0000-4000-8000-000000000002',
        role: 'OWNER',
      } as never),
    ).rejects.toThrow('permission');

    expect(uploadAssetService.delete).not.toHaveBeenCalled();
    expect(prisma.asset.delete).not.toHaveBeenCalled();
  });
});
