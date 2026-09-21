import { PrismaPg } from '@prisma/adapter-pg';
import {
  business_status,
  PrismaClient,
  tenant_domain_type,
  tenant_status,
  user_role,
  user_status,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Pool } from 'pg';

let prisma: PrismaClient;

type SeedUserInput = {
  email: string;
  password: string;
  username: string;
  role: user_role;
  status: user_status;
  is_verified: boolean;
  tenant_id?: string;
};

const DEFAULT_PERMISSION_KEYS = [
  'user:read',
  'user:create',
  'user:update',
  'user:delete',
  'user:manage',
  'permission:read',
  'permission:manage',
  'booking:read',
  'booking:create',
  'booking:update',
  'booking:delete',
  'booking:manage',
  'service:read',
  'service:create',
  'service:update',
  'service:delete',
  'service:manage',
  'category:read',
  'category:create',
  'category:update',
  'category:delete',
  'category:manage',
  'staff:read',
  'staff:invite',
  'staff:update',
  'staff:delete',
  'staff:manage',
  'tenant:read',
  'tenant:update',
  'tenant:manage',
] as const;

function toPermissionSeed(key: string) {
  const [resource, action] = key.split(':');
  if (!resource || !action) {
    throw new Error(`Invalid permission key: ${key}`);
  }

  return {
    key,
    resource,
    action,
    description: `${resource}:${action}`,
  };
}

async function upsertSeedUser(data: SeedUserInput) {
  const [userByEmail, userByUsername] = await Promise.all([
    prisma.user.findUnique({ where: { email: data.email } }),
    prisma.user.findUnique({ where: { username: data.username } }),
  ]);

  if (userByEmail && userByUsername && userByEmail.id !== userByUsername.id) {
    throw new Error(
      `Cannot seed user ${data.email}/${data.username}: email and username belong to different existing users.`,
    );
  }

  const existingUser = userByEmail ?? userByUsername;

  if (existingUser) {
    return prisma.user.update({
      where: { id: existingUser.id },
      data,
    });
  }

  return prisma.user.create({ data });
}

async function main() {
  console.log('Seeding base database...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  const hashedPassword = await bcrypt.hash('password123', 12);

  const demoTenant = await prisma.tenant.upsert({
    where: { slug: 'demo-spa' },
    update: {
      name: 'Demo Spa',
      status: tenant_status.ACTIVE,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi',
    },
    create: {
      slug: 'demo-spa',
      name: 'Demo Spa',
      status: tenant_status.ACTIVE,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi',
      settings: {
        create: {
          settings: {
            branding: {
              primaryColor: '#2563eb',
              displayName: 'Demo Spa',
            },
            features: {
              booking: true,
              notifications: true,
            },
          },
        },
      },
      domains: {
        create: [
          {
            host: 'demo.localhost',
            type: tenant_domain_type.SUBDOMAIN,
            is_primary: true,
          },
          {
            host: 'demo-spa.localhost',
            type: tenant_domain_type.SUBDOMAIN,
            is_primary: false,
          },
        ],
      },
    },
  });

  await prisma.tenantSettings.upsert({
    where: { tenant_id: demoTenant.id },
    update: {
      settings: {
        branding: {
          primaryColor: '#2563eb',
          displayName: 'Demo Spa',
        },
        features: {
          booking: true,
          notifications: true,
        },
      },
    },
    create: {
      tenant_id: demoTenant.id,
      settings: {
        branding: {
          primaryColor: '#2563eb',
          displayName: 'Demo Spa',
        },
        features: {
          booking: true,
          notifications: true,
        },
      },
    },
  });

  await prisma.tenantDomain.upsert({
    where: { host: 'demo.localhost' },
    update: {
      tenant_id: demoTenant.id,
      type: tenant_domain_type.SUBDOMAIN,
      is_primary: true,
    },
    create: {
      tenant_id: demoTenant.id,
      host: 'demo.localhost',
      type: tenant_domain_type.SUBDOMAIN,
      is_primary: true,
    },
  });

  const demoBusiness = await prisma.business.upsert({
    where: {
      tenant_id_slug: {
        tenant_id: demoTenant.id,
        slug: 'demo-spa',
      },
    },
    update: {
      name: 'Demo Spa',
      status: business_status.ACTIVE,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi',
      is_default: true,
      settings: {
        booking_window_days: 30,
      },
    },
    create: {
      tenant_id: demoTenant.id,
      slug: 'demo-spa',
      name: 'Demo Spa',
      status: business_status.ACTIVE,
      timezone: 'Asia/Ho_Chi_Minh',
      locale: 'vi',
      is_default: true,
      settings: {
        booking_window_days: 30,
      },
    },
  });

  await prisma.tenantDomain.upsert({
    where: { host: 'demo-spa.localhost' },
    update: {
      tenant_id: demoTenant.id,
      type: tenant_domain_type.SUBDOMAIN,
      is_primary: false,
    },
    create: {
      tenant_id: demoTenant.id,
      host: 'demo-spa.localhost',
      type: tenant_domain_type.SUBDOMAIN,
      is_primary: false,
    },
  });

  const superAdminUser = await upsertSeedUser({
    email: 'superadmin@example.com',
    password: hashedPassword,
    username: 'superadmin',
    role: user_role.SUPER_ADMIN,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const ownerUser = await upsertSeedUser({
    tenant_id: demoTenant.id,
    email: 'admin@example.com',
    password: hashedPassword,
    username: 'admin',
    role: user_role.OWNER,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const staffUser = await upsertSeedUser({
    tenant_id: demoTenant.id,
    email: 'staff@example.com',
    password: hashedPassword,
    username: 'staff',
    role: user_role.STAFF,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  const customerUser = await upsertSeedUser({
    tenant_id: demoTenant.id,
    email: 'user@example.com',
    password: hashedPassword,
    username: 'user',
    role: user_role.CUSTOMER,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  for (const member of [ownerUser, staffUser]) {
    await prisma.businessMembership.upsert({
      where: {
        user_id_business_id: {
          user_id: member.id,
          business_id: demoBusiness.id,
        },
      },
      update: {},
      create: {
        tenant_id: demoTenant.id,
        business_id: demoBusiness.id,
        user_id: member.id,
      },
    });
  }

  for (const key of DEFAULT_PERMISSION_KEYS) {
    await prisma.permission.upsert({
      where: { key },
      update: toPermissionSeed(key),
      create: toPermissionSeed(key),
    });
  }

  const allPermissions = await prisma.permission.findMany();

  const staffPermissionKeys = new Set([
    'booking:read',
    'booking:create',
    'booking:update',
    'user:read',
    'staff:read',
  ]);

  for (const permission of allPermissions.filter((item) =>
    staffPermissionKeys.has(item.key),
  )) {
    await prisma.userPermission.upsert({
      where: {
        user_id_permission_id_tenant_id: {
          user_id: staffUser.id,
          permission_id: permission.id,
          tenant_id: demoTenant.id,
        },
      },
      update: {},
      create: {
        user_id: staffUser.id,
        permission_id: permission.id,
        tenant_id: demoTenant.id,
        granted_by_id: ownerUser.id,
      },
    });
  }

  console.log('Base database seed completed successfully.');
  console.log(`Tenant: ${demoTenant.name} (${demoTenant.slug})`);
  console.log(`Business: ${demoBusiness.name} (${demoBusiness.slug})`);
  console.log('Tenant domains: demo.localhost, demo-spa.localhost');
  console.log(`Super Admin: ${superAdminUser.email} (${superAdminUser.role})`);
  console.log(`Owner: ${ownerUser.email} (${ownerUser.role})`);
  console.log(`Staff: ${staffUser.email} (${staffUser.role})`);
  console.log(`Customer: ${customerUser.email} (${customerUser.role})`);
  console.log('Default password: password123');
}

main()
  .catch((error) => {
    console.error('Error seeding database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
