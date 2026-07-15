import { PrismaModule } from '@/database/prisma/prisma.module';
import { BusinessController } from '@/modules/business/business.controller';
import { BusinessRepository } from '@/modules/business/repository/business.repository';
import { CreateBusinessUseCase } from '@/modules/business/use-cases/create-business.use-case';
import { ListBusinessesUseCase } from '@/modules/business/use-cases/list-businesses.use-case';
import { Module } from '@nestjs/common';

@Module({
  imports: [PrismaModule],
  controllers: [BusinessController],
  providers: [BusinessRepository, ListBusinessesUseCase, CreateBusinessUseCase],
  exports: [BusinessRepository, ListBusinessesUseCase, CreateBusinessUseCase],
})
export class BusinessModule {}
