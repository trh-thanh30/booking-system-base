import { ResetPasswordUseCase } from '@/modules/auth/use-cases/reset-password.usecase';

describe('ResetPasswordUseCase', () => {
  const dto = {
    sessionId: 'session-1',
    code: '123456',
    password: 'new-password',
    confirmPassword: 'new-password',
  };

  it('validates the code before looking up an account', async () => {
    const prisma = { user: { findUnique: jest.fn() } };

    await expect(
      new ResetPasswordUseCase(
        { verify: jest.fn().mockResolvedValue(false) } as any,
        { getEmail: jest.fn().mockResolvedValue('missing.com') } as any,
        prisma as any,
        { hashPassword: jest.fn() } as any,
      ).execute(dto),
    ).rejects.toThrow('Invalid or expired verification code');

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it('rejects invalid sessions, missing users, and invalid codes', async () => {
    await expect(
      new ResetPasswordUseCase(
        { verify: jest.fn() } as any,
        { getEmail: jest.fn().mockResolvedValue(null) } as any,
        { user: { findUnique: jest.fn() } } as any,
        { hashPassword: jest.fn() } as any,
      ).execute(dto),
    ).rejects.toThrow('Invalid or expired password reset session');

    await expect(
      new ResetPasswordUseCase(
        { verify: jest.fn() } as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        { user: { findUnique: jest.fn().mockResolvedValue(null) } } as any,
        { hashPassword: jest.fn() } as any,
      ).execute(dto),
    ).rejects.toThrow('Invalid or expired verification code');

    await expect(
      new ResetPasswordUseCase(
        { verify: jest.fn().mockResolvedValue(false) } as any,
        { getEmail: jest.fn().mockResolvedValue('user@example.com') } as any,
        {
          user: { findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }) },
        } as any,
        { hashPassword: jest.fn() } as any,
      ).execute(dto),
    ).rejects.toThrow('Invalid or expired verification code');
  });

  it('hashes and stores the new password then deletes the session', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }),
        update: jest.fn().mockResolvedValue(undefined),
      },
    };
    const sessions = {
      getEmail: jest.fn().mockResolvedValue('user@example.com'),
      deleteSession: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      new ResetPasswordUseCase(
        {
          verify: jest.fn().mockResolvedValue(true),
          consume: jest.fn().mockResolvedValue(undefined),
        } as any,
        sessions as any,
        prisma as any,
        { hashPassword: jest.fn().mockResolvedValue('hashed-new') } as any,
      ).execute(dto),
    ).resolves.toBeUndefined();

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { email: 'user@example.com' },
      data: {
        password: 'hashed-new',
        refresh_token_hash: null,
      },
    });
    expect(sessions.deleteSession).toHaveBeenCalledWith(
      'session-1',
      'password_reset',
    );
  });

  it('keeps the verification code and session when the password update fails', async () => {
    const updateError = new Error('database unavailable');
    const verification = {
      verify: jest.fn().mockResolvedValue(true),
      consume: jest.fn().mockResolvedValue(undefined),
    };
    const sessions = {
      getEmail: jest.fn().mockResolvedValue('user@example.com'),
      deleteSession: jest.fn().mockResolvedValue(undefined),
    };

    await expect(
      new ResetPasswordUseCase(
        verification as any,
        sessions as any,
        {
          user: {
            findUnique: jest.fn().mockResolvedValue({ id: 'user-1' }),
            update: jest.fn().mockRejectedValue(updateError),
          },
        } as any,
        { hashPassword: jest.fn().mockResolvedValue('hashed-new') } as any,
      ).execute(dto),
    ).rejects.toThrow(updateError);

    expect(verification.consume).not.toHaveBeenCalled();
    expect(sessions.deleteSession).not.toHaveBeenCalled();
  });
});
