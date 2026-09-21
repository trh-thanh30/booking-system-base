import {
  ApiSuccess,
  Business,
  Permissions,
  RequireBusiness,
  RequireTenant,
  Tenant,
} from '@/common/decorators';
import type { TenantContext } from '@/common/types/tenant-context.types';
import { CreateServiceDto } from '@/modules/service/dto/create-service.dto';
import { ListServicesDto } from '@/modules/service/dto/list-services.dto';
import { UpdateServiceDto } from '@/modules/service/dto/update-service.dto';
import { ArchiveServiceUseCase } from '@/modules/service/use-cases/archive-service.use-case';
import { CreateServiceUseCase } from '@/modules/service/use-cases/create-service.use-case';
import { GetServiceUseCase } from '@/modules/service/use-cases/get-service.use-case';
import { ListServicesUseCase } from '@/modules/service/use-cases/list-services.use-case';
import { UpdateServiceUseCase } from '@/modules/service/use-cases/update-service.use-case';
import { PERMISSIONS } from '@/modules/permission/constants/permission.constants';
import type { BusinessContext } from '@repo/shared';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

@Controller('services')
@RequireTenant()
@RequireBusiness()
export class ServiceController {
  constructor(
    private readonly listServicesUseCase: ListServicesUseCase,
    private readonly getServiceUseCase: GetServiceUseCase,
    private readonly createServiceUseCase: CreateServiceUseCase,
    private readonly updateServiceUseCase: UpdateServiceUseCase,
    private readonly archiveServiceUseCase: ArchiveServiceUseCase,
  ) {}

  @Get()
  @Permissions([PERMISSIONS.SERVICE.READ])
  @ApiSuccess('Services retrieved successfully')
  list(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Query() query: ListServicesDto,
  ) {
    return this.listServicesUseCase.execute(tenant.id, business.id, query);
  }

  @Post()
  @Permissions([PERMISSIONS.SERVICE.CREATE])
  @ApiSuccess('Service created successfully')
  create(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Body() dto: CreateServiceDto,
  ) {
    return this.createServiceUseCase.execute(tenant.id, business.id, dto);
  }

  @Get(':id')
  @Permissions([PERMISSIONS.SERVICE.READ])
  @ApiSuccess('Service retrieved successfully')
  get(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Param('id') id: string,
  ) {
    return this.getServiceUseCase.execute(tenant.id, business.id, id);
  }

  @Patch(':id')
  @Permissions([PERMISSIONS.SERVICE.UPDATE])
  @ApiSuccess('Service updated successfully')
  update(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
  ) {
    return this.updateServiceUseCase.execute(tenant.id, business.id, id, dto);
  }

  @Delete(':id')
  @Permissions([PERMISSIONS.SERVICE.DELETE])
  @ApiSuccess('Service archived successfully')
  archive(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Param('id') id: string,
  ) {
    return this.archiveServiceUseCase.execute(tenant.id, business.id, id);
  }
}
