import { RequestVerificationUseCase } from '@/modules/auth/use-cases/request-verification.usecase';

describe('RequestVerificationUseCase', () => {
  it('does not disclose missing or already verified accounts', async () => {
    const verification = { generate: jest.fn() };
    const emailUseCase = { execute: jest.fn() };

    for (const user of [null, { is_verified: true }]) {
      await expect(
        new RequestVerificationUseCase(
          { findByEmail: jest.fn().mockResolvedValue(user) } as any,
          verification as any,
          {
            createSession: jest.fn().mockResolvedValue('opaque-session'),
          } as any,
          emailUseCase as any,
        ).execute({ email: 'user.com' }),
      ).resolves.toEqual({ sessionId: 'opaque-session' });
    }

    expect(verification.generate).not.toHaveBeenCalled();
    expect(emailUseCase.execute).not.toHaveBeenCalled();
  });

  it('creates a session and sends a verification code', async () => {
    const emailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };
    const verification = {
      generate: jest
        .fn()
        .mockResolvedValue({ code: '123456', expiresAt: Date.now() + 1000 }),
    };

    await expect(
      new RequestVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: false }),
        } as any,
        verification as any,
        { createSession: jest.fn().mockResolvedValue('session-1') } as any,
        emailUseCase as any,
      ).execute({ email: 'user@example.com' }),
    ).resolves.toEqual({ sessionId: 'session-1' });

    expect(emailUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com', code: '123456' }),
    );
  });
});
