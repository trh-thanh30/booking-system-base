import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CommonUtils } from '@/module/common/helpers/common.utils';
import { CommonController } from '@/module/common/common.controller';
import { CommonService } from '@/module/common/common.service';

@Module({
  imports: [HttpModule],
  controllers: [CommonController],
  providers: [CommonService, CommonUtils],
  exports: [CommonService],
})
export class CommonModule {}
