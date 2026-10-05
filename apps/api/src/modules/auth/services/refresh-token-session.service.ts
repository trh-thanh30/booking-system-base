import { Injectable } from '@nestjs/common';
import { createHash, timingSafeEqual } from 'crypto';

@Injectable()
export class RefreshTokenSessionService {
  hash(refreshToken: string): string {
    return createHash('sha256').update(refreshToken).digest('hex');
  }

  matches(
    refreshToken: string,
    storedHash: string | null | undefined,
  ): boolean {
    if (!refreshToken || !storedHash) {
      return false;
    }

    const actual = Buffer.from(this.hash(refreshToken), 'hex');
    const expected = Buffer.from(storedHash, 'hex');

    return (
      actual.length === expected.length && timingSafeEqual(actual, expected)
    );
  }
}
