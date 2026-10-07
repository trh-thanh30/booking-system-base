import { RegisterOwnerAccountUseCase } from '../use-cases/register-owner-account.usecase';

describe('RegisterOwnerAccountUseCase', () => {
  it('persists an unverified Owner without a tenant or authentication tokens', async () => {
    const users = {
      findByEmail: jest.fn().mockResolvedValue(null),
      createUnchecked: jest.fn().mockResolvedValue({ id: 'owner' }),
    };
    const bcrypt = { hashPassword: jest.fn().mockResolvedValue('hash') };
    const sessions = { createSession: jest.fn().mockResolvedValue('session') };
    const verification = {
      generate: jest
        .fn()
        .mockResolvedValue({ code: '123456', expiresAt: Date.now() + 60000 }),
    };
    const email = { execute: jest.fn() };
    const useCase = new RegisterOwnerAccountUseCase(
      users as never,
      bcrypt as never,
      sessions as never,
      verification as never,
      email as never,
    );
    await expect(
      useCase.execute({
        email: 'owner@example.com',
        password: 'password',
        confirmPassword: 'password',
      }),
    ).resolves.toEqual({ sessionId: 'session' });
    expect(users.createUnchecked).toHaveBeenCalledWith(
      expect.objectContaining({
        tenant_id: null,
        role: 'OWNER',
        is_verified: false,
        password: 'hash',
      }),
    );
    expect(email.execute).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'owner@example.com', code: '123456' }),
    );
  });
});
