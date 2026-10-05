import { AuthProfileService } from '@/modules/auth/services/auth-profile.service';
import {
  business_status,
  tenant_status,
  user_role,
  user_status,
} from '@prisma/client';

function business(id: string, tenantId: string) {
  return {
    id,
    tenant_id: tenantId,
    slug: id,
    name: id,
    status: business_status.ACTIVE,
    timezone: 'Asia/Ho_Chi_Minh',
    locale: 'vi',
    settings: {},
    is_default: false,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
  };
}

function staffProfile() {
  return {
    id: 'staff-1',
    tenant_id: 'tenant-1',
    email: 'staff@example.com',
    password: 'hashed-password',
    username: 'staff',
    full_name: 'Staff User',
    phone: null,
    avatar_url: null,
    role: user_role.STAFF,
    status: user_status.ACTIVE,
    is_verified: true,
    refresh_token_hash: null,
    created_at: new Date('2026-01-01T00:00:00.000Z'),
    updated_at: new Date('2026-01-01T00:00:00.000Z'),
    tenant: {
      id: 'tenant-1',
      slug: 'tenant-1',
      name: 'Tenant 1',
      status: tenant_status.ACTIVE,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi',
      businesses: [],
    },
    business_memberships: [
      {
        id: 'membership-1',
        tenant_id: 'tenant-1',
        business_id: 'business-1',
        user_id: 'staff-1',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        business: business('business-1', 'tenant-1'),
      },
      {
        id: 'membership-2',
        tenant_id: 'tenant-2',
        business_id: 'business-2',
        user_id: 'staff-1',
        created_at: new Date('2026-01-01T00:00:00.000Z'),
        business: business('business-2', 'tenant-2'),
      },
    ],
  };
}

describe('AuthProfileService', () => {
  it('returns only Staff businesses that belong to the authenticated tenant', async () => {
    const permissions = {
      execute: jest.fn().mockResolvedValue(['booking:read']),
    };
    const service = new AuthProfileService(
      {
        findAuthProfileById: jest.fn().mockResolvedValue(staffProfile()),
      } as any,
      permissions as any,
    );

    await expect(service.getByUserId('staff-1')).resolves.toMatchObject({
      tenant_id: 'tenant-1',
      businesses: [{ id: 'business-1', tenant_id: 'tenant-1' }],
      permissions: ['booking:read'],
    });
    expect(permissions.execute).toHaveBeenCalledWith('staff-1', 'tenant-1');
  });

  it('never exposes tenant or business context to a Platform Super Admin', async () => {
    const profile = staffProfile();
    const service = new AuthProfileService(
      {
        findAuthProfileById: jest.fn().mockResolvedValue({
          ...profile,
          role: user_role.SUPER_ADMIN,
        }),
      } as any,
      { execute: jest.fn() } as any,
    );

    await expect(service.getByUserId('staff-1')).resolves.toMatchObject({
      tenant_id: null,
      tenant: null,
      businesses: [],
      permissions: ['*'],
    });
  });
});
