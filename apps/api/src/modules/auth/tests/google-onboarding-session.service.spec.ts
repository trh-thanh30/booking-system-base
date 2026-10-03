import { googleOAuthConfig } from '@/config';
import { GoogleOnboardingSessionService } from '@/modules/auth/services/google-onboarding-session.service';

const config = {
  adminUrl: 'http://localhost:3001',
  clientId: 'client-id',
  clientSecret: 'client-secret',
  redirectUri: 'http://localhost:3000/api/v1/auth/admin/google/callback',
  stateTtlSeconds: 600,
  onboardingTtlSeconds: 900,
} satisfies ReturnType<typeof googleOAuthConfig>;

describe('GoogleOnboardingSessionService', () => {
  it('stores and restores a short-lived Google onboarding session', async () => {
    const redis = {
      del: jest.fn().mockResolvedValue(1),
      get: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
    };
    const service = new GoogleOnboardingSessionService(redis as never, config);
    const session = {
      email: 'owner@example.com',
      locale: 'vi' as const,
      providerAccountId: 'google-subject',
      returnTo: '/admin/dashboard',
    };

    const created = await service.create(session);
    const serialized = redis.set.mock.calls[0]?.[1] as string;
    redis.get.mockResolvedValue(serialized);

    await expect(service.get(created.token)).resolves.toEqual(session);
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^auth:oauth:google:onboarding:[a-f0-9]{64}$/),
      expect.any(String),
      900,
    );

    await service.delete(created.token);
    expect(redis.del).toHaveBeenCalledWith(redis.set.mock.calls[0]?.[0]);
  });

  it('rejects an expired onboarding session', async () => {
    const redis = {
      del: jest.fn(),
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn(),
    };
    const service = new GoogleOnboardingSessionService(redis as never, config);

    await expect(service.get('expired-token')).rejects.toMatchObject({
      code: 'GOOGLE_ONBOARDING_SESSION_INVALID',
    });
  });
});
