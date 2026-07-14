import {
  ApiSuccess,
  Permissions,
  RequireTenant,
  Tenant,
} from '@/common/decorators';
import type { TenantContext } from '@/common/types/tenant-context.types';
import { CreateBusinessDto } from '@/modules/business/dto/create-business.dto';
import { CreateBusinessUseCase } from '@/modules/business/use-cases/create-business.use-case';
import { ListBusinessesUseCase } from '@/modules/business/use-cases/list-businesses.use-case';
import { PERMISSIONS } from '@/modules/permission/constants/permission.constants';
import { Body, Controller, Get, Post } from '@nestjs/common';

@Controller('businesses')
@RequireTenant()
export class BusinessController {
  constructor(
    private readonly listBusinessesUseCase: ListBusinessesUseCase,
    private readonly createBusinessUseCase: CreateBusinessUseCase,
  ) {}

  @Get()
  @Permissions([PERMISSIONS.TENANT.READ])
  @ApiSuccess('Businesses retrieved successfully')
  list(@Tenant() tenant: TenantContext) {
    return this.listBusinessesUseCase.execute(tenant.id);
  }

  @Post()
  @Permissions([PERMISSIONS.TENANT.MANAGE])
  @ApiSuccess('Business created successfully')
  create(@Tenant() tenant: TenantContext, @Body() dto: CreateBusinessDto) {
    return this.createBusinessUseCase.execute(tenant.id, dto);
  }
}
