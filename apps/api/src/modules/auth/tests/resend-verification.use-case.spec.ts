import { RateLimitError } from '@/common/response/client-errors';
import { ResendVerificationUseCase } from '@/modules/auth/use-cases/resend-verification.usecase';

describe('ResendVerificationUseCase', () => {
  it('rejects expired sessions but keeps resend responses identical for missing and verified users', async () => {
    const verification = {
      generate: jest
        .fn()
        .mockResolvedValue({ code: '123456', expiresAt: Date.now() + 1000 }),
    };
    const emailUseCase = { execute: jest.fn() };

    await expect(
      new ResendVerificationUseCase(
        { findByEmail: jest.fn() } as any,
        verification as any,
        { getEmail: jest.fn().mockResolvedValue(null) } as any,
        emailUseCase as any,
      ).execute({ sessionId: 'session-1' }),
    ).rejects.toThrow('Invalid or expired verification session');

    await expect(
      new ResendVerificationUseCase(
        { findByEmail: jest.fn().mockResolvedValue(null) } as any,
        verification as any,
        {
          getEmail: jest.fn().mockResolvedValue('user@example.com'),
          extendSession: jest.fn(),
        } as any,
        emailUseCase as any,
      ).execute({ sessionId: 'session-1' }),
    ).resolves.toBeUndefined();

    await expect(
      new ResendVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: true }),
        } as any,
        verification as any,
        {
          getEmail: jest.fn().mockResolvedValue('user@example.com'),
          extendSession: jest.fn(),
        } as any,
        emailUseCase as any,
      ).execute({ sessionId: 'session-1' }),
    ).resolves.toBeUndefined();
    expect(verification.generate).toHaveBeenCalledTimes(2);
    expect(emailUseCase.execute).not.toHaveBeenCalled();
  });

  it('sends a new code and extends the session', async () => {
    const sessions = {
      getEmail: jest.fn().mockResolvedValue('user@example.com'),
      extendSession: jest.fn().mockResolvedValue(undefined),
    };
    const emailUseCase = { execute: jest.fn().mockResolvedValue(undefined) };

    await expect(
      new ResendVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: false }),
        } as any,
        {
          generate: jest.fn().mockResolvedValue({
            code: '123456',
            expiresAt: Date.now() + 1000,
          }),
        } as any,
        sessions as any,
        emailUseCase as any,
      ).execute({ sessionId: 'session-1' }),
    ).resolves.toBeUndefined();

    expect(emailUseCase.execute).toHaveBeenCalledWith(
      expect.objectContaining({ to: 'user@example.com', code: '123456' }),
    );
    expect(sessions.extendSession).toHaveBeenCalledWith(
      'session-1',
      'email_verification',
    );
  });

  it('maps verification rate limit errors to too many requests', async () => {
    await expect(
      new ResendVerificationUseCase(
        {
          findByEmail: jest.fn().mockResolvedValue({ is_verified: false }),
        } as any,
        {
          generate: jest
            .fn()
            .mockRejectedValue(
              new RateLimitError('Too many verification requests'),
            ),
        } as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        { execute: jest.fn() } as any,
      ).execute({ sessionId: 'session-1' }),
    ).rejects.toThrow('Too many verification requests');
  });

  it('keeps resend quota identical for missing and verified accounts', async () => {
    for (const user of [null, { is_verified: true }]) {
      const emailUseCase = { execute: jest.fn() };
      await expect(
        new ResendVerificationUseCase(
          { findByEmail: jest.fn().mockResolvedValue(user) } as any,
          {
            generate: jest
              .fn()
              .mockRejectedValue(new RateLimitError('quota exceeded')),
          } as any,
          { getEmail: jest.fn().mockResolvedValue('owner@example.com') } as any,
          emailUseCase as any,
        ).execute({ sessionId: 's' }),
      ).rejects.toThrow('quota exceeded');
      expect(emailUseCase.execute).not.toHaveBeenCalled();
    }
  });
});
