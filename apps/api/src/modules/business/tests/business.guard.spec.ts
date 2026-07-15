import { BusinessGuard } from '@/common/guards/business.guard';
import { business_status, user_role } from '@prisma/client';

const businessId = '11111111-1111-4111-8111-111111111111';

function context(request: Record<string, unknown>) {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
  };
}

function makeBusiness(overrides: Record<string, unknown> = {}) {
  return {
    id: businessId,
    tenant_id: 'tenant-1',
    slug: 'demo-spa',
    name: 'Demo Spa',
    status: business_status.ACTIVE,
    timezone: 'Asia/Ho_Chi_Minh',
    locale: 'vi',
    settings: {},
    is_default: true,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-02T00:00:00.000Z'),
    ...overrides,
  };
}

function guard(
  requireBusiness: boolean | undefined,
  business = makeBusiness(),
) {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(requireBusiness),
  };
  const businessRepository = {
    findAccessibleById: jest.fn().mockResolvedValue(business),
  };

  return {
    businessGuard: new BusinessGuard(
      reflector as any,
      businessRepository as any,
    ),
    businessRepository,
  };
}

describe('BusinessGuard', () => {
  it('allows requests without required business metadata', async () => {
    const { businessGuard, businessRepository } = guard(undefined);

    await expect(businessGuard.canActivate(context({}) as any)).resolves.toBe(
      true,
    );

    expect(businessRepository.findAccessibleById).not.toHaveBeenCalled();
  });

  it('requires tenant and business headers for business-scoped routes', async () => {
    await expect(
      guard(true).businessGuard.canActivate(context({}) as any),
    ).rejects.toThrow('Tenant context is required');

    await expect(
      guard(true).businessGuard.canActivate(
        context({
          tenant: { id: 'tenant-1' },
          user: { id: 'staff-1', role: user_role.STAFF },
        }) as any,
      ),
    ).rejects.toThrow('Business context is required');
  });

  it('attaches an accessible active business to the request', async () => {
    const request = {
      headers: { 'x-business-id': businessId },
      tenant: { id: 'tenant-1' },
      user: { id: 'staff-1', role: user_role.STAFF },
    };
    const { businessGuard, businessRepository } = guard(true);

    await expect(
      businessGuard.canActivate(context(request) as any),
    ).resolves.toBe(true);

    expect(businessRepository.findAccessibleById).toHaveBeenCalledWith(
      businessId,
      'tenant-1',
      'staff-1',
      false,
    );
    expect(request).toMatchObject({
      business: {
        id: businessId,
        tenant_id: 'tenant-1',
      },
    });
  });

  it('allows owners to select any active business in their tenant', async () => {
    const request = {
      headers: { 'x-business-id': businessId },
      tenant: { id: 'tenant-1' },
      user: { id: 'owner-1', role: user_role.OWNER },
    };
    const { businessGuard, businessRepository } = guard(true);

    await expect(
      businessGuard.canActivate(context(request) as any),
    ).resolves.toBe(true);

    expect(businessRepository.findAccessibleById).toHaveBeenCalledWith(
      businessId,
      'tenant-1',
      'owner-1',
      true,
    );
  });

  it('rejects inaccessible or inactive businesses', async () => {
    await expect(
      guard(true, null as any).businessGuard.canActivate(
        context({
          headers: { 'x-business-id': businessId },
          tenant: { id: 'tenant-1' },
          user: { id: 'staff-1', role: user_role.STAFF },
        }) as any,
      ),
    ).rejects.toThrow('Business is not accessible');

    await expect(
      guard(
        true,
        makeBusiness({ status: business_status.SUSPENDED }),
      ).businessGuard.canActivate(
        context({
          headers: { 'x-business-id': businessId },
          tenant: { id: 'tenant-1' },
          user: { id: 'staff-1', role: user_role.STAFF },
        }) as any,
      ),
    ).rejects.toThrow('Business is not active');
  });
});
