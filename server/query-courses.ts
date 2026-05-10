import { PrismaClient } from './libs/shared/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function main() {
  const prisma = new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL!,
    }),
  });

  const courses = await prisma.course.findMany();
  console.log('课程数据:', JSON.stringify(courses, null, 2));

  await prisma.$disconnect();
}

main().catch(console.error);
