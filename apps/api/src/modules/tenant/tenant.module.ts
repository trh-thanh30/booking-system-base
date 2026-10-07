import { PrismaModule } from '@/database/prisma/prisma.module';
import { BusinessCategoryModule } from '@/modules/business-category/business-category.module';
import {
  InternalTenantController,
  PlatformTenantController,
} from '@/modules/tenant/internal-tenant.controller';
import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { TenantController } from '@/modules/tenant/tenant.controller';
import { CreateTenantWorkspaceUseCase } from '@/modules/tenant/use-cases/create-tenant-workspace.use-case';
import { CreateTenantUseCase } from '@/modules/tenant/use-cases/create-tenant.use-case';
import { GetTenantContextUseCase } from '@/modules/tenant/use-cases/get-tenant-context.use-case';
import { ListTenantsUseCase } from '@/modules/tenant/use-cases/list-tenants.use-case';
import { ResolveTenantUseCase } from '@/modules/tenant/use-cases/resolve-tenant.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule, BusinessCategoryModule],
  controllers: [
    TenantController,
    InternalTenantController,
    PlatformTenantController,
  ],
  providers: [
    TenantRepository,
    ResolveTenantUseCase,
    GetTenantContextUseCase,
    ListTenantsUseCase,
    CreateTenantWorkspaceUseCase,
    CreateTenantUseCase,
  ],
  exports: [
    TenantRepository,
    ResolveTenantUseCase,
    GetTenantContextUseCase,
    ListTenantsUseCase,
    CreateTenantWorkspaceUseCase,
  ],
})
export class TenantModule {}
