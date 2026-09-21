import { ApiSuccess } from '@/common/decorators';
import { Roles } from '@/common/decorators/roles.decorator';
import { CreateTenantDto } from '@/modules/tenant/dto/create-tenant.dto';
import { CreateTenantUseCase } from '@/modules/tenant/use-cases/create-tenant.use-case';
import { GetTenantContextUseCase } from '@/modules/tenant/use-cases/get-tenant-context.use-case';
import { ListTenantsUseCase } from '@/modules/tenant/use-cases/list-tenants.use-case';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { user_role } from '@prisma/client';

@Controller('internal/tenants')
export class InternalTenantController {
  constructor(
    private readonly getTenantContextUseCase: GetTenantContextUseCase,
    private readonly listTenantsUseCase: ListTenantsUseCase,
    private readonly createTenantUseCase: CreateTenantUseCase,
  ) {}

  @Get(':tenantId/context')
  @Roles([user_role.SUPER_ADMIN])
  @ApiSuccess('Tenant context retrieved successfully')
  getContext(@Param('tenantId') tenantId: string) {
    return this.getTenantContextUseCase.execute(tenantId);
  }
}

@Controller('platform/tenants')
@Roles([user_role.SUPER_ADMIN])
export class PlatformTenantController {
  constructor(
    private readonly listTenantsUseCase: ListTenantsUseCase,
    private readonly createTenantUseCase: CreateTenantUseCase,
    private readonly getTenantContextUseCase: GetTenantContextUseCase,
  ) {}

  @Get()
  @ApiSuccess('Tenants retrieved successfully')
  list() {
    return this.listTenantsUseCase.execute();
  }

  @Post()
  @ApiSuccess('Tenant created successfully')
  create(@Body() dto: CreateTenantDto) {
    return this.createTenantUseCase.execute(dto);
  }

  @Get(':tenantId')
  @ApiSuccess('Tenant retrieved successfully')
  get(@Param('tenantId') tenantId: string) {
    return this.getTenantContextUseCase.execute(tenantId);
  }
}
