import { RefreshTokenSessionService } from '@/modules/auth/services/refresh-token-session.service';

describe('RefreshTokenSessionService', () => {
  const service = new RefreshTokenSessionService();

  it('stores a deterministic hash instead of the raw refresh token', () => {
    const rawToken = 'signed-refresh-token';

    const hash = service.hash(rawToken);

    expect(hash).not.toBe(rawToken);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(service.matches(rawToken, hash)).toBe(true);
    expect(service.matches('different-token', hash)).toBe(false);
  });
});
