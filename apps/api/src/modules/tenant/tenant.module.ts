import { PrismaModule } from '@/database/prisma/prisma.module';
import { InternalTenantController } from '@/modules/tenant/internal-tenant.controller';
import { TenantRepository } from '@/modules/tenant/repository/tenant.repository';
import { TenantController } from '@/modules/tenant/tenant.controller';
import { GetTenantContextUseCase } from '@/modules/tenant/use-cases/get-tenant-context.use-case';
import { ResolveTenantUseCase } from '@/modules/tenant/use-cases/resolve-tenant.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [TenantController, InternalTenantController],
  providers: [TenantRepository, ResolveTenantUseCase, GetTenantContextUseCase],
  exports: [TenantRepository, ResolveTenantUseCase, GetTenantContextUseCase],
})
export class TenantModule {}
