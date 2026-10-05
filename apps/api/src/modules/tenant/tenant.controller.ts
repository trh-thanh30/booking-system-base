import { ApiSuccess } from '@/common/decorators';
import { Public } from '@/common/decorators/public.decorator';
import { ResolveTenantUseCase } from '@/modules/tenant/use-cases/resolve-tenant.use-case';
import { Controller, Get, Query } from '@nestjs/common';

@Public()
@Controller('tenants')
export class TenantController {
  constructor(private readonly resolveTenantUseCase: ResolveTenantUseCase) {}

  @Get('resolve')
  @ApiSuccess('Tenant resolved successfully')
  resolve(@Query('host') host: string) {
    return this.resolveTenantUseCase.execute(host);
  }
}
