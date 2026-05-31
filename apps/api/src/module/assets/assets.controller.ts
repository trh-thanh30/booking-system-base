import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { type User as UserEntity } from '@prisma/client';
import { ListAssetsDto } from '@/module/assets/dto/list-assets.dto';
import { Roles } from '@/common/decorators/roles.decorator';
import { User } from '@/common/decorators/user.decorator';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { type Response } from 'express';
import { AssetsService } from '@/module/assets/assets.service';
import { UploadAssetDto } from '@/module/assets/dto/upload-asset.dto';
import { Public } from '@/common/decorators/public.decorator';

@Controller('assets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  /**
   * Upload a file
   */
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @User() user: UserEntity,
    @UploadedFile() file: Express.Multer.File,
    @Query() dto: UploadAssetDto,
  ) {
    return this.assetsService.uploadFile(user, file, dto);
  }

  @Public()
  @Get('thumbnail')
  async findAllThumbnail() {
    return this.assetsService.listAssetsThumbnail();
  }

  /**
   * Get asset metadata
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assetsService.getAsset(id);
  }

  /**
   * List all assets (Admin only)
   */
  @Get()
  @Roles(['ADMIN'])
  async findAll(@Query() dto: ListAssetsDto) {
    return this.assetsService.listAssets(dto);
  }

  /**
   * Delete an asset
   */
  @Delete(':id')
  async remove(
    @User() user: UserEntity,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.assetsService.deleteAsset(id, user);
  }
}
