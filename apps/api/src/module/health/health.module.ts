import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from '@/database/prisma/prisma.module';
import { HealthController } from '@/module/health/health.controller';
import { HealthService } from '@/module/health/health.service';
import { DatabaseHealthIndicator } from '@/module/health/indicators/database.health';
import { SystemHealthIndicator } from '@/module/health/indicators/system.health';

@Module({
  imports: [TerminusModule, PrismaModule],
  controllers: [HealthController],
  providers: [HealthService, DatabaseHealthIndicator, SystemHealthIndicator],
  exports: [HealthService],
})
export class HealthModule {}
