import { Module } from '@nestjs/common';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { ServiceModule } from '@/modules/service/service.module';
import { BusinessSettingsController } from './business-settings.controller';
import { BusinessSettingsRepository } from './repository/business-settings.repository';
import { GetSetupSummaryUseCase } from './use-cases/get-setup-summary.use-case';
import { GetWorkingHoursUseCase } from './use-cases/get-working-hours.use-case';
import { UpdateWorkingHoursUseCase } from './use-cases/update-working-hours.use-case';
import { ListBookingTemplatesUseCase } from './use-cases/list-booking-templates.use-case';
import { SelectBookingTemplateUseCase } from './use-cases/select-booking-template.use-case';
import { SkipBusinessSetupUseCase } from './use-cases/skip-business-setup.use-case';
import { ResumeBusinessSetupUseCase } from './use-cases/resume-business-setup.use-case';

@Module({
  imports: [PrismaModule, ServiceModule],
  controllers: [BusinessSettingsController],
  providers: [
    BusinessSettingsRepository,
    GetSetupSummaryUseCase,
    GetWorkingHoursUseCase,
    UpdateWorkingHoursUseCase,
    ListBookingTemplatesUseCase,
    SelectBookingTemplateUseCase,
    SkipBusinessSetupUseCase,
    ResumeBusinessSetupUseCase,
  ],
  exports: [GetSetupSummaryUseCase],
})
export class BusinessSettingsModule {}
