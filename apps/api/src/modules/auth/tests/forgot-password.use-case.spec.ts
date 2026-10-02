import { ForgotPasswordUseCase } from '@/modules/auth/use-cases/forgot-password.usecase';

describe('ForgotPasswordUseCase', () => {
  it('applies the same reset quota regardless of account existence', async () => {
    for (const user of [null, { id: 'owner' }]) {
      const emailUseCase = { execute: jest.fn() };
      const sessions = {
        createSession: jest.fn().mockResolvedValue('session'),
        deleteSession: jest.fn(),
      };
      await expect(
        new ForgotPasswordUseCase(
          { findByEmail: jest.fn().mockResolvedValue(user) } as any,
          {
            generate: jest.fn().mockRejectedValue(new Error('quota exceeded')),
          } as any,
          sessions as any,
          emailUseCase as any,
        ).execute({ email: 'owner@example.com' }),
      ).rejects.toThrow('quota exceeded');
      expect(sessions.deleteSession).toHaveBeenCalledWith(
        'session',
        'password_reset',
      );
      expect(emailUseCase.execute).not.toHaveBeenCalled();
    }
  });
  it('does not disclose whether an email exists', async () => {
    const verification = {
      generate: jest
        .fn()
        .mockResolvedValue({ code: '123456', expiresAt: Date.now() + 1000 }),
    };
    const emailUseCase = { execute: jest.fn() };

    await expect(
      new ForgotPasswordUseCase(
        { findByEmail: jest.fn().mockResolvedValue(null) } as any,
        verification as any,
        { createSession: jest.fn().mockResolvedValue('opaque-session') } as any,
        emailUseCase as any,
      ).execute({ email: 'missing.com' }),
    ).resolves.toBe('opaque-session');

    expect(verification.generate).toHaveBeenCalledTimes(1);
    expect(emailUseCase.execute).not.toHaveBeenCalled();
  });

  it('creates a reset session and sends a reset email', async () => {
    const emailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };

    await expect(
      new ForgotPasswordUseCase(
        { findByEmail: jest.fn().mockResolvedValue({ id: 'user-1' }) } as any,
        {
          generate: jest.fn().mockResolvedValue({
            code: '654321',
            expiresAt: Date.now() + 1000,
          }),
        } as any,
        { createSession: jest.fn().mockResolvedValue('session-1') } as any,
        emailUseCase as any,
      ).execute({ email: 'user@example.com' }),
    ).resolves.toBe('session-1');

    expect(emailUseCase.execute).toHaveBeenCalledWith({
      to: 'user@example.com',
      code: '654321',
      ttl: expect.any(Date),
    });
  });
});
