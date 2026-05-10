import { PrismaClient } from './libs/shared/src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

async function testDb() {
  console.log('DATABASE_URL:', process.env.DATABASE_URL);
  
  try {
    const prisma = new PrismaClient({
      adapter: new PrismaPg({
        connectionString: process.env.DATABASE_URL!,
      })
    });
    
    await prisma.$connect();
    console.log('Database connected successfully!');
    
    const count = await prisma.course.count();
    console.log('Number of courses:', count);
    
    await prisma.$disconnect();
    console.log('Disconnected from database.');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

testDb();
