import { RedisService } from '@/database/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { HealthCheckError, HealthIndicator } from '@nestjs/terminus';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(private readonly redisService: RedisService) {
    super();
  }

  async isHealthy(key: string) {
    try {
      const pong = await this.redisService.ping();
      const isHealthy = pong === 'PONG';
      const result = this.getStatus(key, isHealthy, { pong });

      if (!isHealthy) {
        throw new HealthCheckError('Redis health check failed', result);
      }

      return result;
    } catch (error) {
      const result = this.getStatus(key, false, {
        message: error instanceof Error ? error.message : 'Redis unavailable',
      });

      throw new HealthCheckError('Redis health check failed', result);
    }
  }
}
