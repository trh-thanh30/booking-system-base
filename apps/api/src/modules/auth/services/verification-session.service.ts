import { Injectable } from '@nestjs/common';
import { RedisService } from '@/database/redis/redis.service';
import { randomBytes } from 'crypto';

export type VerificationSessionPurpose =
  | 'email_verification'
  | 'password_reset';

/**
 * Service for managing verification sessions
 * Uses random session IDs instead of email as keys for security
 */
@Injectable()
export class VerificationSessionService {
  private readonly SESSION_PREFIX = 'vs'; // verification session
  private readonly SESSION_TTL = 15 * 60; // 15 minutes

  constructor(private readonly redisService: RedisService) {}

  /**
   * Create a new verification session
   * @param email User's email address
   * @returns Session ID (random, not email-based)
   */
  async createSession(
    email: string,
    purpose: VerificationSessionPurpose,
  ): Promise<string> {
    // Generate random session ID (looks like a session token)
    const sessionId = randomBytes(32).toString('hex');
    const key = this.getSessionKey(sessionId, purpose);

    // Store email in Redis with session ID as key
    await this.redisService.set(
      key,
      email.trim().toLowerCase(),
      this.SESSION_TTL,
    );

    return sessionId;
  }

  /**
   * Get email from session ID
   * @param sessionId Session ID from cookie
   * @returns Email address or null if not found/expired
   */
  async getEmail(
    sessionId: string,
    purpose: VerificationSessionPurpose,
  ): Promise<string | null> {
    const key = this.getSessionKey(sessionId, purpose);
    const email = await this.redisService.get(key);
    return email;
  }

  /**
   * Delete verification session
   * @param sessionId Session ID to delete
   */
  async deleteSession(
    sessionId: string,
    purpose: VerificationSessionPurpose,
  ): Promise<void> {
    const key = this.getSessionKey(sessionId, purpose);
    await this.redisService.del(key);
  }

  /**
   * Extend session TTL (for resend scenarios)
   * @param sessionId Session ID to extend
   */
  async extendSession(
    sessionId: string,
    purpose: VerificationSessionPurpose,
  ): Promise<void> {
    const key = this.getSessionKey(sessionId, purpose);
    await this.redisService.expire(key, this.SESSION_TTL);
  }

  private getSessionKey(
    sessionId: string,
    purpose: VerificationSessionPurpose,
  ): string {
    return `${this.SESSION_PREFIX}:${purpose}:${sessionId}`;
  }
}
