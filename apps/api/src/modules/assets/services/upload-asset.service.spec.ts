import { UploadAssetService } from '@/modules/assets/services/upload-asset.service';

describe('UploadAssetService', () => {
  it('propagates storage deletion failures so metadata is not deleted', async () => {
    const storage = {
      delete: jest.fn().mockRejectedValue(new Error('storage unavailable')),
    };
    const service = new UploadAssetService(
      storage as never,
      {} as never,
      { cdnUrl: 'https://cdn.test' } as never,
    );

    await expect(
      service.delete('public/category-descriptions/image.png'),
    ).rejects.toThrow('storage unavailable');
  });
});
