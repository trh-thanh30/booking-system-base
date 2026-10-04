import { CompleteGoogleOwnerOnboardingUseCase } from '@/modules/auth/use-cases/complete-google-owner-onboarding.usecase';
import { identity_provider, user_role, user_status } from '@prisma/client';

const onboardingSession = {
  avatarUrl: 'https://example.com/avatar.png',
  email: 'owner@example.com',
  fullName: 'Business Owner',
  locale: 'vi' as const,
  providerAccountId: 'google-subject',
  returnTo: '/admin/dashboard',
};

const input = {
  slug: 'demo-spa',
  name: 'Demo Spa',
  default_business_name: 'Demo Spa Hồ Tây',
  default_business_slug: 'demo-spa-ho-tay',
  locale: 'vi',
  timezone: 'Asia/Ho_Chi_Minh',
  owner: {
    phone: '0900000000',
    username: 'owner',
  },
};

describe('CompleteGoogleOwnerOnboardingUseCase', () => {
  it('attaches a callback-persisted Google Owner instead of creating a second user', async () => {
    const dependencies = makeDependencies();
    dependencies.sessions.get.mockResolvedValue({
      ...onboardingSession,
      userId: 'owner-id',
    });
    dependencies.users.findById.mockResolvedValue({
      id: 'owner-id',
      email: onboardingSession.email,
      role: 'OWNER',
      status: 'ACTIVE',
      tenant_id: null,
      is_verified: true,
    });
    dependencies.users.findByEmail.mockResolvedValue({ id: 'owner-id' });
    dependencies.prisma.userIdentity.findUnique.mockResolvedValue({
      id: 'identity',
      user_id: 'owner-id',
    });
    await createUseCase(dependencies).execute('ticket', {
      ...input,
      business_profile: {
        address: {
          country: 'Vietnam',
          city: 'Hanoi',
          street: '1 Example',
          location: null,
        },
        opening_hours: Array.from({ length: 7 }, (_, day) => ({
          day,
          enabled: day === 1,
          opens: '09:00',
          closes: '18:00',
        })),
      },
    });
    expect(dependencies.workspace.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: expect.objectContaining({
          existingUserId: 'owner-id',
          password: null,
        }),
      }),
    );
  });
  it('provisions a verified Google Owner workspace and creates an admin session', async () => {
    const dependencies = makeDependencies();

    await expect(
      createUseCase(dependencies).execute('onboarding-token', input),
    ).resolves.toMatchObject({
      access_token: 'access-token',
      locale: 'vi',
      returnTo: '/admin/dashboard',
      refresh_token: 'refresh-token',
      owner: { id: 'owner-id', is_verified: true },
      tenant: { id: 'tenant-id' },
      business: { id: 'business-id', is_default: true },
    });

    expect(dependencies.workspace.execute).toHaveBeenCalledWith({
      tenant: expect.objectContaining({
        slug: 'demo-spa',
        name: 'Demo Spa',
        defaultBusinessName: 'Demo Spa Hồ Tây',
        defaultBusinessSlug: 'demo-spa-ho-tay',
      }),
      owner: {
        avatar_url: 'https://example.com/avatar.png',
        email: 'owner@example.com',
        full_name: 'Business Owner',
        identity: {
          provider: identity_provider.GOOGLE,
          providerAccountId: 'google-subject',
          providerEmail: 'owner@example.com',
        },
        isVerified: true,
        password: null,
        phone: '0900000000',
        username: 'owner',
      },
    });
    expect(dependencies.sessions.delete).toHaveBeenCalledWith(
      'onboarding-token',
    );
  });
  it('keeps the onboarding ticket when provisioning fails so the Owner can retry', async () => {
    const dependencies = makeDependencies();
    dependencies.workspace.execute.mockRejectedValue(
      new Error('database unavailable'),
    );

    await expect(
      createUseCase(dependencies).execute('onboarding-token', input),
    ).rejects.toThrow('database unavailable');
    expect(dependencies.sessions.delete).not.toHaveBeenCalled();
  });

  it('rejects an onboarding ticket that already maps to an account', async () => {
    const dependencies = makeDependencies();
    dependencies.users.findByEmail.mockResolvedValue({ id: 'owner-id' });

    await expect(
      createUseCase(dependencies).execute('onboarding-token', input),
    ).rejects.toMatchObject({ code: 'GOOGLE_ONBOARDING_ALREADY_COMPLETED' });
    expect(dependencies.workspace.execute).not.toHaveBeenCalled();
    expect(dependencies.sessions.delete).not.toHaveBeenCalled();
  });
});

function createUseCase(dependencies: ReturnType<typeof makeDependencies>) {
  return new CompleteGoogleOwnerOnboardingUseCase(
    dependencies.prisma as never,
    dependencies.users as never,
    dependencies.workspace as never,
    dependencies.sessions as never,
    dependencies.tokens as never,
    dependencies.refreshSessions as never,
  );
}

function makeDependencies() {
  const owner = {
    id: 'owner-id',
    tenant_id: 'tenant-id',
    email: onboardingSession.email,
    username: input.owner.username,
    full_name: onboardingSession.fullName,
    phone: input.owner.phone,
    avatar_url: onboardingSession.avatarUrl,
    role: user_role.OWNER,
    status: user_status.ACTIVE,
    is_verified: true,
  };

  return {
    prisma: {
      user: {
        update: jest.fn().mockResolvedValue(owner),
      },
      userIdentity: {
        findUnique: jest.fn().mockResolvedValue(null),
      },
    },
    users: {
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findByPhone: jest.fn().mockResolvedValue(null),
      findByUsername: jest.fn().mockResolvedValue(null),
    },
    workspace: {
      execute: jest.fn().mockResolvedValue({
        tenant: { id: 'tenant-id' },
        business: { id: 'business-id', is_default: true },
        owner,
      }),
    },
    sessions: {
      delete: jest.fn().mockResolvedValue(undefined),
      get: jest.fn().mockResolvedValue(onboardingSession),
    },
    tokens: {
      generateTokenPair: jest.fn().mockReturnValue({
        access_token: 'access-token',
        refresh_token: 'refresh-token',
      }),
    },
    refreshSessions: {
      hash: jest.fn().mockReturnValue('refresh-token-hash'),
    },
  };
}
