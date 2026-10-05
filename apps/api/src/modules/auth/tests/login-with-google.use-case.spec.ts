import { ConflictError } from '@/common/response';
import { LoginWithGoogleUseCase } from '@/modules/auth/use-cases/login-with-google.usecase';
import { identity_provider, user_role, user_status } from '@prisma/client';

const oauthSession = {
  codeVerifier: 'code-verifier',
  locale: 'vi',
  nonce: 'nonce',
  returnTo: '/admin/dashboard',
};

const googleProfile = {
  email: 'owner@example.com',
  emailVerified: true,
  name: 'Business Owner',
  picture: 'https://example.com/avatar.png',
  subject: 'google-subject',
};

function owner(overrides: Record<string, unknown> = {}) {
  return {
    id: 'owner-id',
    tenant_id: 'tenant-id',
    email: 'owner@example.com',
    password: 'hashed-password',
    username: 'owner',
    full_name: null,
    phone: null,
    avatar_url: null,
    role: user_role.OWNER,
    status: user_status.ACTIVE,
    is_verified: false,
    refresh_token_hash: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    ...overrides,
  };
}

function createSubject(options?: {
  existingIdentity?: Record<string, unknown> | null;
  existingUserIdentity?: Record<string, unknown> | null;
  user?: ReturnType<typeof owner> | null;
}) {
  const user = options?.user === undefined ? owner() : options.user;
  const persistedUser =
    (options?.existingIdentity?.user as ReturnType<typeof owner> | undefined) ??
    user;
  const transaction = {
    user: {
      findUnique: jest.fn().mockResolvedValue(user),
      update: jest.fn().mockImplementation(({ data }) =>
        Promise.resolve({
          ...persistedUser,
          ...data,
        }),
      ),
    },
    userIdentity: {
      create: jest.fn().mockResolvedValue({ id: 'identity-id' }),
      findFirst: jest
        .fn()
        .mockResolvedValue(options?.existingUserIdentity ?? null),
      findUnique: jest
        .fn()
        .mockResolvedValue(options?.existingIdentity ?? null),
      update: jest.fn().mockResolvedValue({ id: 'identity-id' }),
    },
  };
  const prisma = {
    $transaction: jest.fn((callback) => callback(transaction)),
    user: transaction.user,
    userIdentity: transaction.userIdentity,
  };
  const stateService = {
    consume: jest.fn().mockResolvedValue(oauthSession),
  };
  const googleOAuthProvider = {
    exchangeCode: jest.fn().mockResolvedValue(googleProfile),
  };
  const tokenService = {
    generateTokenPair: jest.fn().mockReturnValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
    }),
  };
  const refreshTokenSessionService = {
    hash: jest.fn().mockReturnValue('refresh-token-hash'),
  };
  const onboardingSessionService = {
    create: jest.fn().mockResolvedValue({
      token: 'onboarding-token',
      ttlSeconds: 900,
    }),
  };

  return {
    googleOAuthProvider,
    onboardingSessionService,
    prisma,
    stateService,
    subject: new LoginWithGoogleUseCase(
      prisma as any,
      googleOAuthProvider as any,
      stateService as any,
      tokenService as any,
      refreshTokenSessionService as any,
      onboardingSessionService as any,
    ),
    tokenService,
    transaction,
  };
}

describe('LoginWithGoogleUseCase', () => {
  it('links a verified Google identity to an existing Owner and creates an admin session', async () => {
    const { subject, stateService, googleOAuthProvider, transaction } =
      createSubject();

    await expect(
      subject.execute({
        code: 'authorization-code',
        state: 'oauth-state',
        stateCookie: 'oauth-state',
      }),
    ).resolves.toMatchObject({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      locale: 'vi',
      returnTo: '/admin/dashboard',
      user: {
        id: 'owner-id',
        is_verified: true,
      },
    });

    expect(stateService.consume).toHaveBeenCalledWith(
      'oauth-state',
      'oauth-state',
    );
    expect(googleOAuthProvider.exchangeCode).toHaveBeenCalledWith({
      code: 'authorization-code',
      codeVerifier: 'code-verifier',
      nonce: 'nonce',
    });
    expect(transaction.userIdentity.create).toHaveBeenCalledWith({
      data: {
        provider: identity_provider.GOOGLE,
        provider_account_id: 'google-subject',
        provider_email: 'owner@example.com',
        user_id: 'owner-id',
      },
    });
    expect(transaction.user.update).toHaveBeenCalledWith({
      where: { id: 'owner-id' },
      data: {
        avatar_url: 'https://example.com/avatar.png',
        full_name: 'Business Owner',
        is_verified: true,
        refresh_token_hash: 'refresh-token-hash',
      },
    });
  });

  it('logs in through an existing Google identity without creating a duplicate', async () => {
    const linkedOwner = owner({ is_verified: true });
    const { subject, transaction } = createSubject({
      existingIdentity: {
        id: 'identity-id',
        provider_email: linkedOwner.email,
        user: linkedOwner,
        user_id: linkedOwner.id,
      },
      user: null,
    });

    await expect(
      subject.execute({
        code: 'authorization-code',
        state: 'oauth-state',
        stateCookie: 'oauth-state',
      }),
    ).resolves.toMatchObject({ user: { id: linkedOwner.id } });

    expect(transaction.userIdentity.create).not.toHaveBeenCalled();
    expect(transaction.userIdentity.update).toHaveBeenCalledWith({
      where: { id: 'identity-id' },
      data: { provider_email: 'owner@example.com' },
    });
  });

  it('starts onboarding when no existing Owner matches the verified Google email', async () => {
    const { subject, transaction, onboardingSessionService } = createSubject({
      user: null,
    });

    await expect(
      subject.execute({
        code: 'authorization-code',
        state: 'oauth-state',
        stateCookie: 'oauth-state',
      }),
    ).resolves.toMatchObject({
      locale: 'vi',
      returnTo: '/admin/dashboard',
      status: 'onboarding_required',
      onboardingToken: 'onboarding-token',
      onboardingTtlSeconds: 900,
    });
    expect(onboardingSessionService.create).toHaveBeenCalledWith({
      avatarUrl: 'https://example.com/avatar.png',
      email: 'owner@example.com',
      fullName: 'Business Owner',
      locale: 'vi',
      providerAccountId: 'google-subject',
      returnTo: '/admin/dashboard',
    });

    expect(transaction.userIdentity.create).not.toHaveBeenCalled();
    expect(transaction.user.update).not.toHaveBeenCalled();
  });

  it.each([
    [owner({ role: user_role.STAFF }), 'GOOGLE_OWNER_REQUIRED'],
    [owner({ tenant_id: null }), 'GOOGLE_OWNER_REQUIRED'],
    [owner({ status: user_status.INACTIVE }), 'GOOGLE_ACCOUNT_INACTIVE'],
  ])('rejects an ineligible account without linking it', async (user, code) => {
    const { subject, transaction } = createSubject({ user });

    await expect(
      subject.execute({
        code: 'authorization-code',
        state: 'oauth-state',
        stateCookie: 'oauth-state',
      }),
    ).rejects.toMatchObject({ code });

    expect(transaction.userIdentity.create).not.toHaveBeenCalled();
  });

  it('rejects linking when the Owner already has another Google identity', async () => {
    const { subject, transaction } = createSubject({
      existingUserIdentity: {
        id: 'other-identity-id',
        provider_account_id: 'another-google-subject',
      },
    });

    await expect(
      subject.execute({
        code: 'authorization-code',
        state: 'oauth-state',
        stateCookie: 'oauth-state',
      }),
    ).rejects.toMatchObject({
      code: 'GOOGLE_IDENTITY_CONFLICT',
    } satisfies Partial<ConflictError>);

    expect(transaction.userIdentity.create).not.toHaveBeenCalled();
  });

  it('consumes state before handling a cancelled Google authorization', async () => {
    const { subject, stateService, googleOAuthProvider } = createSubject();

    await expect(
      subject.execute({
        error: 'access_denied',
        state: 'oauth-state',
        stateCookie: 'oauth-state',
      }),
    ).rejects.toMatchObject({ code: 'GOOGLE_AUTH_CANCELLED' });

    expect(stateService.consume).toHaveBeenCalledWith(
      'oauth-state',
      'oauth-state',
    );
    expect(googleOAuthProvider.exchangeCode).not.toHaveBeenCalled();
  });
});
