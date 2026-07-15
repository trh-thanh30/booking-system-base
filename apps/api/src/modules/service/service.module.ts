import { PrismaModule } from '@/database/prisma/prisma.module';
import { CategoryRepository } from '@/modules/category/repository/category.repository';
import { ServiceRepository } from '@/modules/service/repository/service.repository';
import { ServiceController } from '@/modules/service/service.controller';
import { ArchiveServiceUseCase } from '@/modules/service/use-cases/archive-service.use-case';
import { CreateServiceUseCase } from '@/modules/service/use-cases/create-service.use-case';
import { GetServiceUseCase } from '@/modules/service/use-cases/get-service.use-case';
import { ListServicesUseCase } from '@/modules/service/use-cases/list-services.use-case';
import { UpdateServiceUseCase } from '@/modules/service/use-cases/update-service.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceController],
  providers: [
    ServiceRepository,
    CategoryRepository,
    ListServicesUseCase,
    GetServiceUseCase,
    CreateServiceUseCase,
    UpdateServiceUseCase,
    ArchiveServiceUseCase,
  ],
  exports: [
    ServiceRepository,
    ListServicesUseCase,
    GetServiceUseCase,
    CreateServiceUseCase,
    UpdateServiceUseCase,
    ArchiveServiceUseCase,
  ],
})
export class ServiceModule {}
