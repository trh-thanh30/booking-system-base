import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { PrismaService } from '@/database/prisma/prisma.service';
import { AuthTokenService } from '@/module/auth/service/auth-token.service';
import { AssetsController } from '@/module/assets/assets.controller';
import { AssetsService } from '@/module/assets/assets.service';
import { FileValidatorService } from '@/module/assets/services/file-validator.service';
import { LocalStorageService } from '@/module/assets/services/local-storage.service';
import { UploadAssetService } from '@/module/assets/services/upload-asset.service';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
    }),
  ],
  controllers: [AssetsController],
  providers: [
    PrismaService,
    AuthTokenService,
    AssetsService,
    UploadAssetService,
    FileValidatorService,
    {
      provide: 'IStorageService',
      useClass: LocalStorageService,
    },
  ],
  exports: [AssetsService, UploadAssetService],
})
export class AssetsModule {}
