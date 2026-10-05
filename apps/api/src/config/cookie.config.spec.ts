describe('cookieConfig', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  function loadConfig() {
    let config:
      | ReturnType<typeof import('@/config/cookie.config').default>
      | undefined;

    jest.isolateModules(() => {
      const { default: cookieConfig } = jest.requireActual<
        typeof import('@/config/cookie.config')
      >('@/config/cookie.config');
      config = cookieConfig();
    });

    return config;
  }

  it('forces secure HttpOnly refresh cookies in production', () => {
    process.env.NODE_ENV = 'production';
    process.env.COOKIE_SECURE = 'false';
    process.env.COOKIE_HTTP_ONLY = 'false';

    expect(loadConfig()).toMatchObject({
      httpOnly: true,
      secure: true,
      refreshPaths: {
        admin: '/api/v1/auth/admin',
        client: '/api/v1/auth',
        platform: '/api/v1/auth/platform',
      },
    });
  });

  it('rejects cookie expiration that differs from refresh-token TTL', () => {
    process.env.JWT_REFRESH_EXPIRES_IN = '1d';
    process.env.COOKIE_MAX_AGE = '604800000';

    expect(() => loadConfig()).toThrow(
      'COOKIE_MAX_AGE must match JWT_REFRESH_EXPIRES_IN',
    );
  });

  it('rejects SameSite=None until CSRF protection is implemented', () => {
    process.env.NODE_ENV = 'production';
    process.env.COOKIE_SAME_SITE = 'none';

    expect(() => loadConfig()).toThrow(
      'COOKIE_SAME_SITE=none requires CSRF protection',
    );
  });
});
