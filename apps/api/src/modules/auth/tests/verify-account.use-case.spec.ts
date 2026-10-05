import { VerifyAccountUseCase } from '@/modules/auth/use-cases/verify-account.usecase';

describe('VerifyAccountUseCase', () => {
  const params = {
    sessionId: 'session-1',
    code: '123456',
  };

  it('validates the code before looking up an account', async () => {
    const prisma = { user: { findUnique: jest.fn() } };

    await expect(
      new VerifyAccountUseCase(
        { verify: jest.fn().mockResolvedValue(false) } as any,
        { getEmail: jest.fn().mockResolvedValue('missing.com') } as any,
        prisma as any,
      ).execute(params),
    ).rejects.toThrow('Invalid or expired verification code');

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects invalid sessions, missing users, already verified users, and invalid codes', async () => {
    await expect(
      new VerifyAccountUseCase(
        { verify: jest.fn() } as any,
        { getEmail: jest.fn().mockResolvedValue(null) } as any,
        { user: { findUnique: jest.fn() } } as any,
      ).execute(params),
    ).rejects.toThrow('Invalid or expired verification session');

    await expect(
      new VerifyAccountUseCase(
        { verify: jest.fn() } as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        { user: { findUnique: jest.fn().mockResolvedValue(null) } } as any,
      ).execute(params),
    ).rejects.toThrow('Invalid or expired verification code');

    await expect(
      new VerifyAccountUseCase(
        {
          verify: jest.fn().mockResolvedValue(true),
          consume: jest.fn(),
        } as any,
        {
          getEmail: jest.fn().mockResolvedValue('user@example.com'),
          deleteSession: jest.fn(),
        } as any,
        {
          user: {
            findUnique: jest.fn().mockResolvedValue({ is_verified: true }),
          },
        } as any,
      ).execute(params),
    ).resolves.toBeUndefined();

    await expect(
      new VerifyAccountUseCase(
        { verify: jest.fn().mockResolvedValue(false) } as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        {
          user: {
            findUnique: jest.fn().mockResolvedValue({ is_verified: false }),
          },
        } as any,
      ).execute(params),
    ).rejects.toThrow('Invalid or expired verification code');
  });

  it('does not consume the code when marking the account verified fails', async () => {
    const verification = {
      verify: jest.fn().mockResolvedValue(true),
      consume: jest.fn(),
    };

    await expect(
      new VerifyAccountUseCase(
        verification as any,
        { getEmail: jest.fn().mockResolvedValue('user.com') } as any,
        {
          user: {
            findUnique: jest.fn().mockResolvedValue({ is_verified: false }),
            update: jest.fn().mockRejectedValue(new Error('database failed')),
          },
        } as any,
      ).execute(params),
    ).rejects.toThrow('database failed');

    expect(verification.consume).not.toHaveBeenCalled();
  });

  it('marks user verified and deletes the session', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ is_verified: false }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const sessions = {
      getEmail: jest.fn().mockResolvedValue('user@example.com'),
      deleteSession: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      new VerifyAccountUseCase(
        {
          verify: jest.fn().mockResolvedValue(true),
          consume: jest.fn().mockResolvedValue(undefined),
        } as any,
        sessions as any,
        prisma as any,
      ).execute(params),
    ).resolves.toBeUndefined();

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: { is_verified: true },
    });
    expect(sessions.deleteSession).toHaveBeenCalledWith(
      'session-1',
      'email_verification',
    );
  });
});
