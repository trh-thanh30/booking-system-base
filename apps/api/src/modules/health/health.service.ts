import { DatabaseHealthIndicator } from '@/modules/health/indicators/database.health';
import { RedisHealthIndicator } from '@/modules/health/indicators/redis.health';
import { SystemHealthIndicator } from '@/modules/health/indicators/system.health';
import { Injectable } from '@nestjs/common';
import { HealthCheckService } from '@nestjs/terminus';

@Injectable()
export class HealthService {
  constructor(
    private health: HealthCheckService,
    private db: DatabaseHealthIndicator,
    private redis: RedisHealthIndicator,
    private system: SystemHealthIndicator,
  ) {}

  async check() {
    return this.readiness();
  }

  async readiness() {
    return this.health.check([
      () => this.db.isHealthy('database'),
      () => this.redis.isHealthy('redis'),
      () => this.system.checkSystem(),
    ]);
  }

  async liveness() {
    return this.health.check([() => this.system.checkSystem()]);
  }
}
