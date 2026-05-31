import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommonService } from '@/module/common/common.service';

@ApiTags('Common')
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('uk-address')
  search(@Query('q') q: string) {
    return this.commonService.search(q);
  }
}
