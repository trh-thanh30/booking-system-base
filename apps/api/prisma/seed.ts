import { PrismaPg } from '@prisma/adapter-pg';
import {
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

  const adminUser = await upsertSeedUser({
    tenant_id: demoTenant.id,
    email: 'admin@example.com',
    password: hashedPassword,
    username: 'admin',
    role: user_role.ADMIN,
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

  const regularUser = await upsertSeedUser({
    tenant_id: demoTenant.id,
    email: 'user@example.com',
    password: hashedPassword,
    username: 'user',
    role: user_role.USER,
    status: user_status.ACTIVE,
    is_verified: true,
  });

  console.log('Base database seed completed successfully.');
  console.log(`Tenant: ${demoTenant.name} (${demoTenant.slug})`);
  console.log('Tenant domains: demo.localhost, demo-spa.localhost');
  console.log(`Admin: ${adminUser.email} (${adminUser.role})`);
  console.log(`Staff: ${staffUser.email} (${staffUser.role})`);
  console.log(`User: ${regularUser.email} (${regularUser.role})`);
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
