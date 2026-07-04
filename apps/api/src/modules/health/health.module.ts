import { PrismaModule } from '@/database/prisma/prisma.module';
import { HealthController } from '@/modules/health/health.controller';
import { HealthService } from '@/modules/health/health.service';
import { DatabaseHealthIndicator } from '@/modules/health/indicators/database.health';
import { RedisHealthIndicator } from '@/modules/health/indicators/redis.health';
import { SystemHealthIndicator } from '@/modules/health/indicators/system.health';
import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { RedisModule } from '@/database/redis/redis.module';

@Module({
  imports: [TerminusModule, PrismaModule, RedisModule],
  controllers: [HealthController],
  providers: [
    HealthService,
    DatabaseHealthIndicator,
    RedisHealthIndicator,
    SystemHealthIndicator,
  ],
  exports: [HealthService],
})
export class HealthModule {}
