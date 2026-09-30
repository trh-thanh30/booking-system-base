const mockOAuthClient = {
  generateAuthUrl: jest.fn(),
  getToken: jest.fn(),
  verifyIdToken: jest.fn(),
};

jest.mock('google-auth-library', () => ({
  CodeChallengeMethod: { S256: 'S256' },
  OAuth2Client: jest.fn(() => mockOAuthClient),
}));

import { GoogleOAuthProvider } from '@/modules/auth/providers/google-oauth.provider';

describe('GoogleOAuthProvider', () => {
  const config = {
    adminUrl: 'http://localhost:3001',
    clientId: 'google-client-id',
    clientSecret: 'google-client-secret',
    redirectUri: 'http://localhost:3000/api/v1/auth/admin/google/callback',
    stateTtlSeconds: 600,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates an authorization URL with state, nonce, PKCE and minimal scopes', () => {
    mockOAuthClient.generateAuthUrl.mockReturnValue(
      'https://accounts.google.com/o/oauth2/v2/auth',
    );
    const provider = new GoogleOAuthProvider(config);

    expect(
      provider.createAuthorizationUrl({
        codeChallenge: 'challenge',
        nonce: 'nonce',
        state: 'state',
      }),
    ).toBe('https://accounts.google.com/o/oauth2/v2/auth');
    expect(mockOAuthClient.generateAuthUrl).toHaveBeenCalledWith({
      access_type: 'online',
      code_challenge: 'challenge',
      code_challenge_method: 'S256',
      nonce: 'nonce',
      prompt: 'select_account',
      scope: ['openid', 'email', 'profile'],
      state: 'state',
    });
  });

  it('exchanges the code and returns only a verified normalized identity', async () => {
    mockOAuthClient.getToken.mockResolvedValue({
      tokens: { id_token: 'id-token' },
    });
    mockOAuthClient.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: ' Owner@Example.com ',
        email_verified: true,
        name: 'Owner',
        nonce: 'nonce',
        picture: 'https://example.com/avatar.png',
        sub: 'google-subject',
      }),
    });
    const provider = new GoogleOAuthProvider(config);

    await expect(
      provider.exchangeCode({
        code: 'code',
        codeVerifier: 'verifier',
        nonce: 'nonce',
      }),
    ).resolves.toEqual({
      email: 'owner@example.com',
      emailVerified: true,
      name: 'Owner',
      picture: 'https://example.com/avatar.png',
      subject: 'google-subject',
    });
    expect(mockOAuthClient.getToken).toHaveBeenCalledWith({
      code: 'code',
      codeVerifier: 'verifier',
      redirect_uri: config.redirectUri,
    });
    expect(mockOAuthClient.verifyIdToken).toHaveBeenCalledWith({
      audience: config.clientId,
      idToken: 'id-token',
    });
  });

  it.each([
    [{ email_verified: false, nonce: 'nonce' }, 'GOOGLE_EMAIL_NOT_VERIFIED'],
    [{ email_verified: true, nonce: 'another-nonce' }, 'GOOGLE_NONCE_INVALID'],
  ])('rejects an unsafe Google ID token', async (overrides, code) => {
    mockOAuthClient.getToken.mockResolvedValue({
      tokens: { id_token: 'id-token' },
    });
    mockOAuthClient.verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        email: 'owner@example.com',
        sub: 'google-subject',
        ...overrides,
      }),
    });
    const provider = new GoogleOAuthProvider(config);

    await expect(
      provider.exchangeCode({
        code: 'code',
        codeVerifier: 'verifier',
        nonce: 'nonce',
      }),
    ).rejects.toMatchObject({ code });
  });

  it('fails closed when OAuth credentials are missing', () => {
    const provider = new GoogleOAuthProvider({
      ...config,
      clientId: '',
      clientSecret: '',
      redirectUri: '',
    });

    expect(() =>
      provider.createAuthorizationUrl({
        codeChallenge: 'challenge',
        nonce: 'nonce',
        state: 'state',
      }),
    ).toThrow('Google OAuth is not configured');
  });
});
