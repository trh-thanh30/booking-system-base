import {
  ApiSuccess,
  Business,
  RequireBusiness,
  RequireTenant,
  Tenant,
} from '@/common/decorators';
import { Roles } from '@/common/decorators/roles.decorator';
import type { TenantContext } from '@/common/types/tenant-context.types';
import type { BusinessContext } from '@repo/shared';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiHeader, ApiTags } from '@nestjs/swagger';
import { user_role } from '@prisma/client';
import { UpdateWorkingHoursDto } from './dto/update-working-hours.dto';
import { SelectBookingTemplateDto } from './dto/select-booking-template.dto';
import { GetSetupSummaryUseCase } from './use-cases/get-setup-summary.use-case';
import { GetWorkingHoursUseCase } from './use-cases/get-working-hours.use-case';
import { UpdateWorkingHoursUseCase } from './use-cases/update-working-hours.use-case';
import { ListBookingTemplatesUseCase } from './use-cases/list-booking-templates.use-case';
import { SelectBookingTemplateUseCase } from './use-cases/select-booking-template.use-case';
import { SkipBusinessSetupUseCase } from './use-cases/skip-business-setup.use-case';
import { ResumeBusinessSetupUseCase } from './use-cases/resume-business-setup.use-case';

// Override implicit conversion for JSON bodies: e.g. the string "false" must not become true.
const settingsBodyOptions = {
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  transformOptions: { enableImplicitConversion: false },
};
const hoursBodyPipe = new ValidationPipe({
  ...settingsBodyOptions,
  expectedType: UpdateWorkingHoursDto,
});
const templateBodyPipe = new ValidationPipe({
  ...settingsBodyOptions,
  expectedType: SelectBookingTemplateDto,
});

@ApiTags('Business settings')
@ApiHeader({ name: 'x-business-id', required: true })
@Controller('business-settings')
@RequireTenant()
@RequireBusiness()
export class BusinessSettingsController {
  constructor(
    private readonly summary: GetSetupSummaryUseCase,
    private readonly getHours: GetWorkingHoursUseCase,
    private readonly updateHours: UpdateWorkingHoursUseCase,
    private readonly listTemplates: ListBookingTemplatesUseCase,
    private readonly selectTemplate: SelectBookingTemplateUseCase,
    private readonly skipSetup: SkipBusinessSetupUseCase,
    private readonly resumeSetup: ResumeBusinessSetupUseCase,
  ) {}

  @Get('setup-summary')
  @Roles([user_role.OWNER, user_role.STAFF])
  @ApiSuccess('Business setup summary retrieved successfully')
  getSummary(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
  ) {
    return this.summary.execute(tenant.id, business.id);
  }

  @Get('working-hours')
  @Roles([user_role.OWNER, user_role.STAFF])
  @ApiSuccess('Business working hours retrieved successfully')
  workingHours(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
  ) {
    return this.getHours.execute(tenant.id, business.id);
  }

  @Put('working-hours')
  @ApiBody({ type: UpdateWorkingHoursDto })
  @Roles([user_role.OWNER])
  @ApiSuccess('Business working hours updated successfully')
  saveWorkingHours(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Body(hoursBodyPipe) dto: unknown,
  ) {
    return this.updateHours.execute(tenant.id, business.id, dto);
  }

  @Get('booking-templates')
  @Roles([user_role.OWNER, user_role.STAFF])
  @ApiSuccess('Booking templates retrieved successfully')
  templates(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
  ) {
    return this.listTemplates.execute(tenant.id, business.id);
  }

  @Put('booking-template')
  @ApiBody({ type: SelectBookingTemplateDto })
  @Roles([user_role.OWNER])
  @ApiSuccess('Booking template selected successfully')
  saveTemplate(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
    @Body(templateBodyPipe) dto: unknown,
  ) {
    return this.selectTemplate.execute(tenant.id, business.id, dto);
  }

  @Post('skip')
  @HttpCode(200)
  @Roles([user_role.OWNER])
  @ApiSuccess('Business setup skipped successfully')
  skip(@Tenant() tenant: TenantContext, @Business() business: BusinessContext) {
    return this.skipSetup.execute(tenant.id, business.id);
  }

  @Post('resume')
  @HttpCode(200)
  @Roles([user_role.OWNER])
  @ApiSuccess('Business setup resumed successfully')
  resume(
    @Tenant() tenant: TenantContext,
    @Business() business: BusinessContext,
  ) {
    return this.resumeSetup.execute(tenant.id, business.id);
  }
}
