import { ForgotPasswordUseCase } from '@/modules/auth/use-cases/forgot-password.usecase';

describe('ForgotPasswordUseCase', () => {
  it('does not disclose whether an email exists', async () => {
    const verification = { generate: jest.fn() };
    const emailUseCase = { execute: jest.fn() };

    await expect(
      new ForgotPasswordUseCase(
        { findByEmail: jest.fn().mockResolvedValue(null) } as any,
        verification as any,
        { createSession: jest.fn().mockResolvedValue('opaque-session') } as any,
        emailUseCase as any,
      ).execute({ email: 'missing.com' }),
    ).resolves.toBe('opaque-session');

    expect(verification.generate).not.toHaveBeenCalled();
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
