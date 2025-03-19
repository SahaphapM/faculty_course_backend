import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../src/enums/role.enum';
const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;
  // Seed data
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
    skipDuplicates: true, // Optional: skips if email already exists
  });

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
