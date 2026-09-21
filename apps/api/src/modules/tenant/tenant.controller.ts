import { ApiSuccess } from '@/common/decorators';
import { Public } from '@/common/decorators/public.decorator';
import { SignupTenantDto } from '@/modules/tenant/dto/signup-tenant.dto';
import { SignupTenantUseCase } from '@/modules/tenant/use-cases/signup-tenant.use-case';
import { ResolveTenantUseCase } from '@/modules/tenant/use-cases/resolve-tenant.use-case';
import { Body, Controller, Get, Post, Query } from '@nestjs/common';

@Public()
@Controller('tenants')
export class TenantController {
  constructor(
    private readonly resolveTenantUseCase: ResolveTenantUseCase,
    private readonly signupTenantUseCase: SignupTenantUseCase,
  ) {}

  @Get('resolve')
  @ApiSuccess('Tenant resolved successfully')
  resolve(@Query('host') host: string) {
    return this.resolveTenantUseCase.execute(host);
  }

  @Post('signup')
  @ApiSuccess('Tenant signed up successfully')
  signup(@Body() dto: SignupTenantDto) {
    return this.signupTenantUseCase.execute(dto);
  }
}
