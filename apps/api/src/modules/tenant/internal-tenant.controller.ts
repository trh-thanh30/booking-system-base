import { ApiSuccess } from '@/common/decorators';
import { Roles } from '@/common/decorators/roles.decorator';
import { GetTenantContextUseCase } from '@/modules/tenant/use-cases/get-tenant-context.use-case';
import { Controller, Get, Param } from '@nestjs/common';
import { user_role } from '@prisma/client';

@Controller('internal/tenants')
export class InternalTenantController {
  constructor(
    private readonly getTenantContextUseCase: GetTenantContextUseCase,
  ) {}

  @Get(':tenantId/context')
  @Roles([user_role.ADMIN])
  @ApiSuccess('Tenant context retrieved successfully')
  getContext(@Param('tenantId') tenantId: string) {
    return this.getTenantContextUseCase.execute(tenantId);
  }
}
