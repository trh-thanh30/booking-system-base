import { Public } from '@/common/decorators/public.decorator';
import { CommonService } from '@/modules/common/common.service';
import { ForwardGeocodingDto } from '@/modules/common/dto/forward-geocoding.dto';
import { ReverseGeocodingDto } from '@/modules/common/dto/reverse-geocoding.dto';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Common')
@Public()
@Controller('common')
export class CommonController {
  constructor(private readonly commonService: CommonService) {}

  @Get('uk-address')
  search(@Query('q') q: string) {
    return this.commonService.search(q);
  }

  @Get('geocoding/forward')
  forwardGeocode(@Query() query: ForwardGeocodingDto) {
    return this.commonService.forwardGeocode(query);
  }

  @Get('geocoding/reverse')
  reverseGeocode(@Query() query: ReverseGeocodingDto) {
    return this.commonService.reverseGeocode(query);
  }
}
