import { VerificationSessionService } from '@/modules/auth/services/verification-session.service';

type PurposeBoundSessionService = {
  createSession(email: string, purpose: string): Promise<string>;
  getEmail(sessionId: string, purpose: string): Promise<string | null>;
};

describe('VerificationSessionService', () => {
  it('isolates sessions by verification purpose', async () => {
    const values = new Map<string, string>();
    const redis = {
      set: jest.fn((key: string, value: string) => {
        values.set(key, value);
        return Promise.resolve('OK' as const);
      }),
      get: jest.fn((key: string) => Promise.resolve(values.get(key) ?? null)),
      del: jest.fn(),
      expire: jest.fn(),
    };
    const service = new VerificationSessionService(redis as never);
    const purposeBound = service as unknown as PurposeBoundSessionService;

    const sessionId = await purposeBound.createSession(
      'User@Example.com',
      'email_verification',
    );

    await expect(
      purposeBound.getEmail(sessionId, 'email_verification'),
    ).resolves.toBe('user@example.com');
    await expect(
      purposeBound.getEmail(sessionId, 'password_reset'),
    ).resolves.toBeNull();
    expect(redis.set).toHaveBeenCalledWith(
      `vs:email_verification:${sessionId}`,
      'user@example.com',
      15 * 60,
    );
  });
});
