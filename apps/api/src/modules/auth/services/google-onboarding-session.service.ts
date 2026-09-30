import { UnauthorizedError } from '@/common/response';
import { googleOAuthConfig } from '@/config';
import { RedisService } from '@/database/redis/redis.service';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createHash, randomBytes } from 'node:crypto';

export type GoogleOnboardingSession = {
  avatarUrl?: string;
  email: string;
  fullName?: string;
  locale: 'vi' | 'en';
  providerAccountId: string;
  returnTo: string;
};

@Injectable()
export class GoogleOnboardingSessionService {
  constructor(
    private readonly redisService: RedisService,
    @Inject(googleOAuthConfig.KEY)
    private readonly config: ConfigType<typeof googleOAuthConfig>,
  ) {}

  async create(session: GoogleOnboardingSession): Promise<{
    token: string;
    ttlSeconds: number;
  }> {
    const token = randomBytes(32).toString('base64url');
    await this.redisService.set(
      this.getKey(token),
      JSON.stringify(session),
      this.config.onboardingTtlSeconds,
    );
    return { token, ttlSeconds: this.config.onboardingTtlSeconds };
  }

  async get(token: string): Promise<GoogleOnboardingSession> {
    if (!token) this.throwInvalidSession();
    const serialized = await this.redisService.get(this.getKey(token));
    if (!serialized) this.throwInvalidSession();

    try {
      const session: unknown = JSON.parse(serialized);
      if (!this.isSession(session)) this.throwInvalidSession();
      return session;
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      this.throwInvalidSession();
    }
  }

  async delete(token: string): Promise<void> {
    if (token) await this.redisService.del(this.getKey(token));
  }

  get ttlSeconds(): number {
    return this.config.onboardingTtlSeconds;
  }

  private getKey(token: string): string {
    const digest = createHash('sha256').update(token).digest('hex');
    return `auth:oauth:google:onboarding:${digest}`;
  }

  private isSession(value: unknown): value is GoogleOnboardingSession {
    if (!this.isRecord(value)) return false;
    return (
      typeof value.email === 'string' &&
      typeof value.providerAccountId === 'string' &&
      (value.locale === 'vi' || value.locale === 'en') &&
      typeof value.returnTo === 'string' &&
      (value.avatarUrl === undefined || typeof value.avatarUrl === 'string') &&
      (value.fullName === undefined || typeof value.fullName === 'string')
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private throwInvalidSession(): never {
    throw new UnauthorizedError(
      'Google onboarding session is invalid or expired',
      'GOOGLE_ONBOARDING_SESSION_INVALID',
    );
  }
}
