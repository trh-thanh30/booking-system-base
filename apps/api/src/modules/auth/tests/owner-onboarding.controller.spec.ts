import { OwnerOnboardingController } from '../controllers/owner-onboarding.controller';

describe('OwnerOnboardingController session handoff', () => {
  it('sets the Admin refresh cookie and returns only the safe profile and access token', async () => {
    const onboarding = {
      execute: jest.fn().mockResolvedValue({
        owner: { id: 'owner', password: 'secret-hash' },
        access_token: 'access',
        refresh_token: 'refresh',
      }),
    };
    const cookies = {
      getOwnerOnboardingCookie: jest.fn().mockReturnValue('verified-ticket'),
      clearOwnerOnboardingCookie: jest.fn(),
      setRefreshCookies: jest.fn(),
    };
    const profile = { id: 'owner', role: 'OWNER', tenant_id: 'tenant' };
    const profiles = { getByUserId: jest.fn().mockResolvedValue(profile) };
    const controller = new OwnerOnboardingController(
      onboarding as never,
      {} as never,
      cookies as never,
      {} as never,
      profiles as never,
    );
    const response = {};
    const input = {};
    const result = await controller.complete(
      input as never,
      {} as never,
      response as never,
    );
    expect(onboarding.execute).toHaveBeenCalledWith('verified-ticket', input);
    expect(cookies.setRefreshCookies).toHaveBeenCalledWith(
      response,
      'admin',
      'refresh',
    );
    expect(cookies.clearOwnerOnboardingCookie).toHaveBeenCalledWith(response);
    expect(result).toEqual({ access_token: 'access', user: profile });
    expect(result).not.toHaveProperty('refresh_token');
    expect(result).not.toHaveProperty('owner');
  });
});
