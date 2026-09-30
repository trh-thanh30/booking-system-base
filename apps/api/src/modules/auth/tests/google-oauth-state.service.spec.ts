import { googleOAuthConfig } from '@/config';
import { GoogleOAuthStateService } from '@/modules/auth/services/google-oauth-state.service';

describe('GoogleOAuthStateService', () => {
  const config = {
    adminUrl: 'http://localhost:3001',
    clientId: 'client-id',
    clientSecret: 'client-secret',
    redirectUri: 'http://localhost:3000/api/v1/auth/admin/google/callback',
    stateTtlSeconds: 600,
  } satisfies ReturnType<typeof googleOAuthConfig>;

  function createSubject() {
    const redis = {
      getdel: jest.fn(),
      set: jest.fn().mockResolvedValue('OK'),
    };
    return {
      redis,
      subject: new GoogleOAuthStateService(redis as any, config),
    };
  }

  it('stores nonce, PKCE verifier and sanitized navigation context with a TTL', async () => {
    const { redis, subject } = createSubject();

    const result = await subject.create({
      locale: 'en',
      returnTo: '/businesses?tab=active',
    });

    expect(result.state).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(result.nonce).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(result.codeVerifier).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(result.codeChallenge).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(redis.set).toHaveBeenCalledWith(
      expect.stringMatching(/^auth:oauth:google:state:[a-f0-9]{64}$/),
      expect.any(String),
      600,
    );

    const stored = JSON.parse(redis.set.mock.calls[0]?.[1] as string);
    expect(stored).toEqual({
      codeVerifier: result.codeVerifier,
      locale: 'en',
      nonce: result.nonce,
      returnTo: '/businesses?tab=active',
    });
  });

  it.each([
    'https://attacker.example/path',
    '//attacker.example/path',
    '/\\attacker.example/path',
    '/dashboard\r\nLocation:https://attacker.example',
  ])(
    'replaces an unsafe returnTo path with the dashboard',
    async (returnTo) => {
      const { redis, subject } = createSubject();

      await subject.create({ returnTo });

      const stored = JSON.parse(redis.set.mock.calls[0]?.[1] as string);
      expect(stored.returnTo).toBe('/dashboard');
    },
  );

  it('requires a browser-bound state cookie before consuming the one-time state', async () => {
    const { redis, subject } = createSubject();

    await expect(
      subject.consume('state', 'another-state'),
    ).rejects.toMatchObject({ code: 'GOOGLE_OAUTH_STATE_INVALID' });
    expect(redis.getdel).not.toHaveBeenCalled();
  });

  it('atomically consumes a valid state and rejects a replay', async () => {
    const { redis, subject } = createSubject();
    const session = {
      codeVerifier: 'code-verifier',
      locale: 'vi',
      nonce: 'nonce',
      returnTo: '/dashboard',
    };
    redis.getdel
      .mockResolvedValueOnce(JSON.stringify(session))
      .mockResolvedValueOnce(null);

    await expect(subject.consume('state', 'state')).resolves.toEqual(session);
    await expect(subject.consume('state', 'state')).rejects.toMatchObject({
      code: 'GOOGLE_OAUTH_STATE_INVALID',
    });
  });
});
