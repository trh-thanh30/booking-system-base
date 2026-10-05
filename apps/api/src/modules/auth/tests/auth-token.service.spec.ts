import { AuthTokenService } from '@/modules/auth/services/auth-token.service';

describe('AuthTokenService', () => {
  const service = new AuthTokenService({
    accessExpiresIn: '15m',
    accessSecret: 'access-secret-for-tests',
    refreshExpiresIn: '7d',
    refreshSecret: 'refresh-secret-for-tests',
  });
  const user = {
    id: 'user-1',
    tenant_id: 'tenant-1',
    email: 'owner@example.com',
    username: 'owner',
    role: 'OWNER',
    status: 'ACTIVE',
  };

  it('rejects a valid refresh token when it is used in another auth context', () => {
    const tokens = service.generateTokenPair(user, 'admin');

    expect(
      service.verifyRefreshToken(tokens.refresh_token, 'admin').payload,
    ).toMatchObject({ auth_context: 'admin', id: 'user-1' });
    expect(() =>
      service.verifyRefreshToken(tokens.refresh_token, 'platform'),
    ).toThrow('Invalid or expired refresh token');
  });

  it('binds access and refresh tokens to the authenticated tenant and context', () => {
    const tokens = service.generateTokenPair(user, 'admin');

    expect(
      service.verifyAccessToken(tokens.access_token).payload,
    ).toMatchObject({
      auth_context: 'admin',
      id: 'user-1',
      tenant_id: 'tenant-1',
    });
    expect(
      service.verifyRefreshToken(tokens.refresh_token, 'admin').payload,
    ).toMatchObject({
      auth_context: 'admin',
      id: 'user-1',
      tenant_id: 'tenant-1',
    });
  });
});
