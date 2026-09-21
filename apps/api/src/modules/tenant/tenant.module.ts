import { PrismaModule } from '@/database/prisma/prisma.module';
import { BcryptService } from '@/common/helpers/bcrypt.util';
import {
  InternalTenantController,
  PlatformTenantController,
} from '@/modules/tenant/internal-tenant.controller';
import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { TenantController } from '@/modules/tenant/tenant.controller';
import { CreateTenantUseCase } from '@/modules/tenant/use-cases/create-tenant.use-case';
import { GetTenantContextUseCase } from '@/modules/tenant/use-cases/get-tenant-context.use-case';
import { ListTenantsUseCase } from '@/modules/tenant/use-cases/list-tenants.use-case';
import { ResolveTenantUseCase } from '@/modules/tenant/use-cases/resolve-tenant.use-case';
import { SignupTenantUseCase } from '@/modules/tenant/use-cases/signup-tenant.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
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
    CreateTenantUseCase,
    SignupTenantUseCase,
    BcryptService,
  ],
  exports: [
    TenantRepository,
    ResolveTenantUseCase,
    GetTenantContextUseCase,
    ListTenantsUseCase,
  ],
})
export class TenantModule {}
