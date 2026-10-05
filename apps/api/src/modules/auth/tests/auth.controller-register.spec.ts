jest.mock('@/modules/assets/assets.service', () => ({
  AssetsService: class AssetsService {},
}));
jest.mock('@/modules/permission/constants/permission.constants', () => ({
  PERMISSIONS: { STAFF: { INVITE: 'staff:invite' } },
}));

import { AuthController } from '@/modules/auth/controllers/auth.controller';

describe('AuthController owner registration', () => {
  it('delegates registration without issuing auth cookies or tokens', async () => {
    const result = {
      tenant: { id: 'tenant-1' },
      business: { id: 'business-1', is_default: true },
      owner: { id: 'owner-1', role: 'OWNER', is_verified: false },
      sessionId: 'session-1',
    };
    const registerOwner = {
      execute: jest.fn().mockResolvedValue(result),
    };
    const authCookies = {
      setRefreshCookies: jest.fn(),
    };
    const unused = {} as never;
    const controller = new AuthController(
      registerOwner as never,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      unused,
      authCookies as never,
      unused,
    );
    const dto = {
      slug: 'demo-spa',
      name: 'Demo Spa',
      owner: {
        email: 'owner@example.com',
        username: 'owner',
        password: 'password',
        confirmPassword: 'password',
      },
    };

    await expect(controller.register(dto)).resolves.toBe(result);
    expect(registerOwner.execute).toHaveBeenCalledWith(dto);
    expect(authCookies.setRefreshCookies).not.toHaveBeenCalled();
    expect(result).not.toHaveProperty('access_token');
    expect(result).not.toHaveProperty('refresh_token');
  });
});
