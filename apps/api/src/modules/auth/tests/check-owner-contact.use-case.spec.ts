import { CheckOwnerContactUseCase } from '../use-cases/check-owner-contact.usecase';

function setup() {
  const users = {
    findById: jest.fn().mockResolvedValue({
      id: 'owner',
      role: 'OWNER',
      status: 'ACTIVE',
      is_verified: true,
      tenant_id: null,
    }),
    findByUsername: jest.fn().mockResolvedValue(null),
    findByPhone: jest.fn().mockResolvedValue(null),
  };
  const email = { get: jest.fn().mockResolvedValue('owner') };
  const google = { get: jest.fn().mockResolvedValue({ userId: 'owner' }) };
  return {
    users,
    email,
    google,
    useCase: new CheckOwnerContactUseCase(
      users as never,
      email as never,
      google as never,
    ),
  };
}

describe('CheckOwnerContactUseCase', () => {
  it('rejects invalid international numbers before querying availability', async () => {
    const { useCase, users } = setup();
    await expect(
      useCase.execute(
        { emailToken: 'ticket' },
        { field: 'phone', value: '+8412212121211212121212' },
      ),
    ).rejects.toThrow('Invalid contact field');
    expect(users.findByPhone).not.toHaveBeenCalled();
  });
  it('checks canonical phone numbers so formatted values cannot bypass uniqueness', async () => {
    const { useCase, users } = setup();
    await useCase.execute(
      { emailToken: 'ticket' },
      { field: 'phone', value: '+1 213 373 4253' },
    );
    expect(users.findByPhone).toHaveBeenCalledWith('+12133734253');
  });
  it('checks trimmed usernames and permits the current pending Owner', async () => {
    const { useCase, users } = setup();
    users.findByUsername.mockResolvedValue({ id: 'owner' });
    expect(
      await useCase.execute(
        { emailToken: 'ticket' },
        { field: 'username', value: ' owner ' },
      ),
    ).toEqual({ field: 'username', value: 'owner', available: true });
    expect(users.findByUsername).toHaveBeenCalledWith('owner');
  });
  it('reports an existing phone as unavailable through a Google onboarding session', async () => {
    const { useCase, users } = setup();
    users.findByPhone.mockResolvedValue({ id: 'other' });
    expect(
      await useCase.execute(
        { googleToken: 'ticket' },
        { field: 'phone', value: '+84912345678' },
      ),
    ).toMatchObject({ available: false });
  });
  it('rejects missing sessions before querying contact availability', async () => {
    const { useCase, email, users } = setup();
    email.get.mockRejectedValue(new Error('expired'));
    await expect(
      useCase.execute({}, { field: 'phone', value: '+84912345678' }),
    ).rejects.toThrow('expired');
    expect(users.findByPhone).not.toHaveBeenCalled();
  });
  it('rejects an Owner who has already provisioned a workspace', async () => {
    const { useCase, users } = setup();
    users.findById.mockResolvedValue({
      id: 'owner',
      role: 'OWNER',
      status: 'ACTIVE',
      is_verified: true,
      tenant_id: 'tenant',
    });
    await expect(
      useCase.execute(
        { emailToken: 'ticket' },
        { field: 'username', value: 'owner' },
      ),
    ).rejects.toThrow();
    expect(users.findByUsername).not.toHaveBeenCalled();
  });
});
