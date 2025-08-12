import { PrismaClient } from '@prisma/client';
import * as bcrypt from '@node-rs/bcrypt';

enum UserRole {
  Admin = 'Administrator',
  Coordinator = 'Coordinator',
  Instructor = 'Instructor',
  Student = 'Student',
}

export async function createUsers(prisma: PrismaClient) {
  console.log('🌱 Creating users...');
  
  const saltRounds = 10;
  
  await prisma.user.createMany({
    data: [
      {
        email: 'admin@buu.dev',
        password: await bcrypt.hash('pass2025', saltRounds),
        role: UserRole.Admin,
      },
      {
        email: 'coo@buu.dev',
        password: await bcrypt.hash('pass2025', saltRounds),
        role: UserRole.Coordinator,
      },
      {
        email: 'ins@buu.dev',
        password: await bcrypt.hash('pass2025', saltRounds),
        role: UserRole.Instructor,
      },
      {
        email: 'stu@buu.dev',
        password: await bcrypt.hash('pass2025', saltRounds),
        role: UserRole.Student,
      },
    ],
    skipDuplicates: true,
  });
  
  console.log('✅ Users created successfully');
}
