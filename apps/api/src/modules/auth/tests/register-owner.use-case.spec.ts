import { RegisterOwnerUseCase } from '@/modules/auth/use-cases/register-owner.usecase';
import { user_role, user_status } from '@prisma/client';

const input = {
  slug: 'demo-spa',
  name: 'Demo Spa',
  owner: {
    email: ' Owner@Example.com ',
    username: 'owner',
    password: 'password',
    confirmPassword: 'password',
  },
};

describe('RegisterOwnerUseCase', () => {
  it('registers one Owner workspace and starts email verification', async () => {
    const dependencies = makeDependencies();

    await expect(
      createUseCase(dependencies).execute(input),
    ).resolves.toMatchObject({
      business: { id: 'business-1', is_default: true },
      owner: { id: 'owner-1', role: user_role.OWNER, is_verified: false },
      sessionId: 'session-1',
      tenant: { id: 'tenant-1' },
    });

    expect(dependencies.workspace.execute).toHaveBeenCalledWith({
      tenant: expect.objectContaining({ slug: 'demo-spa', name: 'Demo Spa' }),
      owner: expect.objectContaining({
        email: 'owner@example.com',
        password: 'hashed-password',
        username: 'owner',
      }),
    });
    expect(dependencies.sessions.createSession).toHaveBeenCalledWith(
      'owner@example.com',
      'email_verification',
    );
    expect(dependencies.email.execute).toHaveBeenCalledWith({
      code: '123456',
      to: 'owner@example.com',
      ttl: expect.any(Number),
    });
  });

  it.each([
    ['email', { findByEmail: jest.fn().mockResolvedValue({ id: 'user-1' }) }],
    [
      'username',
      { findByUsername: jest.fn().mockResolvedValue({ id: 'user-1' }) },
    ],
    ['phone', { findByPhone: jest.fn().mockResolvedValue({ id: 'user-1' }) }],
  ])('rejects a duplicate %s before creating a workspace', async (_, users) => {
    const dependencies = makeDependencies({ users });

    await expect(
      createUseCase(dependencies).execute({
        ...input,
        owner: { ...input.owner, phone: '0900000000' },
      }),
    ).rejects.toBeDefined();

    expect(dependencies.workspace.execute).not.toHaveBeenCalled();
    expect(dependencies.sessions.createSession).not.toHaveBeenCalled();
  });

  it('rejects mismatched passwords before checking identity', async () => {
    const dependencies = makeDependencies();

    await expect(
      createUseCase(dependencies).execute({
        ...input,
        owner: { ...input.owner, confirmPassword: 'different' },
      }),
    ).rejects.toThrow('Confirm password does not match');

    expect(dependencies.users.findByEmail).not.toHaveBeenCalled();
  });

  it('deletes the verification session when workspace creation fails', async () => {
    const creationError = new Error('database unavailable');
    const dependencies = makeDependencies({
      workspace: { execute: jest.fn().mockRejectedValue(creationError) },
    });

    await expect(createUseCase(dependencies).execute(input)).rejects.toThrow(
      creationError,
    );
    expect(dependencies.sessions.deleteSession).toHaveBeenCalledWith(
      'session-1',
      'email_verification',
    );
  });

  it('returns the workspace when the verification email cannot be queued', async () => {
    const dependencies = makeDependencies({
      email: { execute: jest.fn().mockRejectedValue(new Error('queue down')) },
    });

    await expect(
      createUseCase(dependencies).execute(input),
    ).resolves.toMatchObject({
      business: { is_default: true },
      owner: { is_verified: false },
      sessionId: 'session-1',
    });
    expect(dependencies.sessions.deleteSession).not.toHaveBeenCalled();
  });
});

function createUseCase(dependencies: ReturnType<typeof makeDependencies>) {
  return new RegisterOwnerUseCase(
    dependencies.users as never,
    dependencies.bcrypt as never,
    dependencies.workspace as never,
    dependencies.verification as never,
    dependencies.sessions as never,
    dependencies.email as never,
  );
}

function makeDependencies(
  overrides: {
    users?: Partial<
      Record<'findByEmail' | 'findByUsername' | 'findByPhone', jest.Mock>
    >;
    workspace?: { execute: jest.Mock };
    email?: { execute: jest.Mock };
  } = {},
) {
  return {
    users: {
      findByEmail: jest.fn().mockResolvedValue(null),
      findByUsername: jest.fn().mockResolvedValue(null),
      findByPhone: jest.fn().mockResolvedValue(null),
      ...overrides.users,
    },
    bcrypt: { hashPassword: jest.fn().mockResolvedValue('hashed-password') },
    workspace: overrides.workspace ?? {
      execute: jest.fn().mockResolvedValue({
        tenant: { id: 'tenant-1', name: 'Demo Spa' },
        business: { id: 'business-1', is_default: true },
        owner: {
          id: 'owner-1',
          tenant_id: 'tenant-1',
          email: 'owner@example.com',
          username: 'owner',
          full_name: null,
          role: user_role.OWNER,
          status: user_status.ACTIVE,
          is_verified: false,
        },
      }),
    },
    verification: {
      generate: jest.fn().mockResolvedValue({
        code: '123456',
        expiresAt: Date.now() + 15 * 60 * 1000,
      }),
    },
    sessions: {
      createSession: jest.fn().mockResolvedValue('session-1'),
      deleteSession: jest.fn().mockResolvedValue(undefined),
    },
    email: overrides.email ?? {
      execute: jest.fn().mockResolvedValue(undefined),
    },
  };
}
