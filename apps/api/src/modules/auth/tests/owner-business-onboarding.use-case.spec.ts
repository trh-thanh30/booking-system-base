import { OwnerBusinessOnboardingUseCase } from '../use-cases/owner-business-onboarding.usecase';

const owner = {
  id: 'owner',
  role: 'OWNER',
  status: 'ACTIVE',
  is_verified: true,
  tenant_id: null,
  email: 'owner@example.com',
  password: 'hash',
  full_name: null,
  avatar_url: null,
};
const input = {
  business_category_id: '2518359c-6d0d-4ad8-a7ce-10f00eb36074',
  name: 'Demo',
  slug: 'demo',
  timezone: 'Asia/Ho_Chi_Minh',
  locale: 'vi',
  owner: { username: 'owner' },
  business_profile: {
    address: {
      countryCode: 'VN',
      addressLine1: '1 Example',
      addressLine2: '',
      locality: 'Hanoi',
      administrativeAreaLevel1: 'Hanoi',
      administrativeAreaLevel2: '',
      postalCode: '100000',
      formattedAddress: '1 Example, Hanoi, Vietnam',
      location: null,
    },
    opening_hours: Array.from({ length: 7 }, (_, day) => ({
      day,
      enabled: day === 1,
      opens: '09:00',
      closes: '18:00',
    })),
  },
};
function setup(user: unknown = owner) {
  const users = {
    findById: jest.fn().mockResolvedValue(user),
    findByEmail: jest.fn().mockResolvedValue(user),
    findByEmailOrUsername: jest.fn().mockResolvedValue(user),
    findByUsername: jest.fn().mockResolvedValue(null),
    findByPhone: jest.fn().mockResolvedValue(null),
  };
  const sessions = {
    get: jest.fn().mockResolvedValue('owner'),
    create: jest.fn().mockResolvedValue('ticket'),
    delete: jest.fn(),
  };
  const verification = { getEmail: jest.fn().mockResolvedValue(owner.email) };
  const verify = { execute: jest.fn() };
  const bcrypt = { comparePassword: jest.fn().mockResolvedValue(true) };
  const workspace = {
    execute: jest.fn().mockResolvedValue({
      owner: { id: 'owner' },
      business: { id: 'business' },
    }),
  };
  return {
    users,
    sessions,
    verify,
    bcrypt,
    workspace,
    useCase: new OwnerBusinessOnboardingUseCase(
      users as never,
      sessions as never,
      verification as never,
      verify as never,
      bcrypt as never,
      workspace as never,
    ),
  };
}
describe('OwnerBusinessOnboardingUseCase', () => {
  it('attaches the verified persisted Owner and stores business-only setup', async () => {
    const { useCase, workspace, sessions } = setup();
    await useCase.execute('ticket', input);
    expect(workspace.execute).toHaveBeenCalledWith(
      expect.objectContaining({
        owner: expect.objectContaining({ existingUserId: 'owner' }),
        tenant: expect.objectContaining({
          businessCategoryId: input.business_category_id,
          defaultBusinessSettings: { onboarding: input.business_profile },
        }),
      }),
    );
    expect(sessions.delete).toHaveBeenCalledWith('ticket');
  });
  it.each([
    { ...owner, is_verified: false },
    { ...owner, role: 'STAFF' },
    { ...owner, status: 'INACTIVE' },
    { ...owner, tenant_id: 'tenant' },
    null,
  ])('rejects an ineligible Owner before provisioning', async (user) => {
    const { useCase, workspace } = setup(user);
    await expect(useCase.execute('ticket', input)).rejects.toMatchObject({
      code: 'OWNER_ONBOARDING_SESSION_INVALID',
    });
    expect(workspace.execute).not.toHaveBeenCalled();
  });
  it('rejects invalid hours and coordinates at the server boundary', async () => {
    const { useCase, workspace } = setup();
    await expect(
      useCase.execute('ticket', {
        ...input,
        business_profile: {
          ...input.business_profile,
          address: {
            ...input.business_profile.address,
            location: { latitude: 91, longitude: 0 },
          },
        },
      }),
    ).rejects.toMatchObject({ code: 'OWNER_ONBOARDING_INPUT_INVALID' });
    expect(workspace.execute).not.toHaveBeenCalled();
  });
  it('retains its ticket after a database failure', async () => {
    const { useCase, workspace, sessions } = setup();
    workspace.execute.mockRejectedValue(new Error('database unavailable'));
    await expect(useCase.execute('ticket', input)).rejects.toThrow(
      'database unavailable',
    );
    expect(sessions.delete).not.toHaveBeenCalled();
  });
  it('does not issue a ticket before successful verification', async () => {
    const { useCase, verify, sessions } = setup();
    verify.execute.mockRejectedValue(new Error('wrong OTP'));
    await expect(
      useCase.verify({ sessionId: 'verification', code: '000000' }),
    ).rejects.toThrow('wrong OTP');
    expect(sessions.create).not.toHaveBeenCalled();
  });
  it('resumes only after password validation', async () => {
    const { useCase, bcrypt, sessions } = setup();
    bcrypt.comparePassword.mockResolvedValue(false);
    await expect(
      useCase.resume({ usernameOrEmail: owner.email, password: 'wrong' }),
    ).rejects.toThrow('Invalid credentials');
    expect(sessions.create).not.toHaveBeenCalled();
  });
});
