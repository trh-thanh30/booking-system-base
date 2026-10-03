import { UnauthorizedError } from '@/common/response';
import { googleOAuthConfig } from '@/config';
import { RedisService } from '@/database/redis/redis.service';
import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { createHash, randomBytes, timingSafeEqual } from 'node:crypto';
import { getSafeAdminReturnTo } from '@repo/shared';

export type GoogleOAuthSession = {
  codeVerifier: string;
  locale: 'vi' | 'en';
  nonce: string;
  returnTo: string;
};

type CreatedGoogleOAuthSession = GoogleOAuthSession & {
  codeChallenge: string;
  state: string;
};

@Injectable()
export class GoogleOAuthStateService {
  constructor(
    private readonly redisService: RedisService,
    @Inject(googleOAuthConfig.KEY)
    private readonly config: ConfigType<typeof googleOAuthConfig>,
  ) {}

  async create(input: {
    locale?: 'vi' | 'en';
    returnTo?: string;
  }): Promise<CreatedGoogleOAuthSession> {
    const state = this.randomValue();
    const codeVerifier = this.randomValue();
    const session: GoogleOAuthSession = {
      codeVerifier,
      locale: input.locale ?? 'vi',
      nonce: this.randomValue(),
      returnTo: getSafeAdminReturnTo(input.returnTo),
    };

    await this.redisService.set(
      this.getKey(state),
      JSON.stringify(session),
      this.config.stateTtlSeconds,
    );

    return {
      ...session,
      codeChallenge: createHash('sha256')
        .update(codeVerifier)
        .digest('base64url'),
      state,
    };
  }

  async consume(
    state: string,
    stateCookie: string,
  ): Promise<GoogleOAuthSession> {
    if (!this.valuesMatch(state, stateCookie)) {
      throw new UnauthorizedError(
        'Invalid Google OAuth state',
        'GOOGLE_OAUTH_STATE_INVALID',
      );
    }

    const serialized = await this.redisService.getdel(this.getKey(state));
    if (!serialized) {
      throw new UnauthorizedError(
        'Google OAuth state has expired or was already used',
        'GOOGLE_OAUTH_STATE_INVALID',
      );
    }

    try {
      const session: unknown = JSON.parse(serialized);
      if (!this.isGoogleOAuthSession(session)) {
        throw new Error('Incomplete OAuth session');
      }
      return session;
    } catch {
      throw new UnauthorizedError(
        'Invalid Google OAuth session',
        'GOOGLE_OAUTH_STATE_INVALID',
      );
    }
  }

  get ttlSeconds(): number {
    return this.config.stateTtlSeconds;
  }

  private isGoogleOAuthSession(value: unknown): value is GoogleOAuthSession {
    if (!this.isRecord(value)) return false;
    const session = value;
    return (
      typeof session.codeVerifier === 'string' &&
      (session.locale === 'vi' || session.locale === 'en') &&
      typeof session.nonce === 'string' &&
      typeof session.returnTo === 'string'
    );
  }

  private isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private getKey(state: string): string {
    const digest = createHash('sha256').update(state).digest('hex');
    return `auth:oauth:google:state:${digest}`;
  }

  private randomValue(): string {
    return randomBytes(32).toString('base64url');
  }

  private valuesMatch(value: string, expected: string): boolean {
    if (!value || !expected) return false;
    const actualBuffer = Buffer.from(value);
    const expectedBuffer = Buffer.from(expected);
    return (
      actualBuffer.length === expectedBuffer.length &&
      timingSafeEqual(actualBuffer, expectedBuffer)
    );
  }
}
