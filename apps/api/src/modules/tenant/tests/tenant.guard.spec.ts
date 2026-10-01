import { TenantGuard } from '@/common/guards/tenant.guard';
import { tenant_status, user_role } from '@prisma/client';

function context(request: Record<string, unknown>) {
  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue(request),
    }),
  };
}

describe('TenantGuard', () => {
  it('rejects a tenant selected outside the authenticated Admin tenant', () => {
    const guard = new TenantGuard({
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as any);

    expect(() =>
      guard.canActivate(
        context({
          tenant: { id: 'tenant-2', status: tenant_status.ACTIVE },
          user: {
            id: 'owner-1',
            role: user_role.OWNER,
            auth_context: 'admin',
            tenant_id: 'tenant-1',
          },
        }) as any,
      ),
    ).toThrow('Tenant is not accessible');
  });

  it('rejects client-context users from Business Admin tenant routes', () => {
    const guard = new TenantGuard({
      getAllAndOverride: jest.fn().mockReturnValue(true),
    } as any);

    expect(() =>
      guard.canActivate(
        context({
          tenant: { id: 'tenant-1', status: tenant_status.ACTIVE },
          user: {
            id: 'customer-1',
            role: user_role.CUSTOMER,
            auth_context: 'client',
            tenant_id: 'tenant-1',
          },
        }) as any,
      ),
    ).toThrow('Tenant is not accessible');
  });
});
