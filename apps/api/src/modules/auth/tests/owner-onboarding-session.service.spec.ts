import { OwnerOnboardingSessionService } from '../services/owner-onboarding-session.service';

describe('OwnerOnboardingSessionService', () => {
  it('stores only user ID under a hashed key with a bounded TTL', async () => {
    const redis = {
      set: jest.fn(),
      get: jest.fn().mockResolvedValue('owner'),
      del: jest.fn(),
    };
    const sessions = new OwnerOnboardingSessionService(redis as never);
    const token = await sessions.create('owner');
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^auth:owner:onboarding:[a-f0-9]{64}$/),
      'owner',
      1800,
    );
    expect(redis.set.mock.calls[0][0]).not.toContain(token);
    await expect(sessions.get(token)).resolves.toBe('owner');
    redis.get.mockResolvedValue(null);
    await expect(sessions.get(token)).rejects.toMatchObject({
      code: 'OWNER_ONBOARDING_SESSION_INVALID',
    });
    await expect(sessions.get('')).rejects.toMatchObject({
      code: 'OWNER_ONBOARDING_SESSION_INVALID',
    });
  });
});
