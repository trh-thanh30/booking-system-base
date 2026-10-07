import { UnauthorizedError } from '@/common/response';
import { RedisService } from '@/database/redis/redis.service';
import { Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';

@Injectable()
export class OwnerOnboardingSessionService {
  readonly ttlSeconds = 1800;
  constructor(private readonly redis: RedisService) {}
  async create(userId: string) {
    const token = randomBytes(32).toString('base64url');
    await this.redis.set(this.key(token), userId, this.ttlSeconds);
    return token;
  }
  async get(token: string) {
    const id = token ? await this.redis.get(this.key(token)) : null;
    if (!id)
      throw new UnauthorizedError(
        'Owner onboarding session expired',
        'OWNER_ONBOARDING_SESSION_INVALID',
      );
    return id;
  }
  async delete(token: string) {
    await this.redis.del(this.key(token));
  }
  private key(token: string) {
    return `auth:owner:onboarding:${createHash('sha256').update(token).digest('hex')}`;
  }
}
