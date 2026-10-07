describe('corsConfig', () => {
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
      | ReturnType<typeof import('@/config/cors.config').default>
      | undefined;

    jest.isolateModules(() => {
      const { default: corsConfig } = jest.requireActual<
        typeof import('@/config/cors.config')
      >('@/config/cors.config');
      config = corsConfig();
    });

    return config;
  }

  it('maps environment values to the CORS configuration namespace', () => {
    process.env.CORS_ORIGINS =
      'http://localhost:3001,https://platform.bookingbase.com';
    process.env.ADMIN_WORKSPACE_URL = 'https://app.bookingbase.com';

    expect(loadConfig()).toEqual({
      origins: ['http://localhost:3001', 'https://platform.bookingbase.com'],
      adminWorkspaceUrl: 'https://app.bookingbase.com',
    });
  });
});
