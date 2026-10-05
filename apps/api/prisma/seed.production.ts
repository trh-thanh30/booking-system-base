import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { seedBusinessCategories } from './seeds/business-categories.seed';

let prisma: PrismaClient | undefined;

async function main() {
  console.log('Seeding production database...');
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not defined');
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  prisma = new PrismaClient({ adapter });

  await seedBusinessCategories(prisma);

  console.log('Production database seed completed successfully.');
}

main()
  .catch((error) => {
    console.error('Error seeding production database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma?.$disconnect();
  });
