import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function reset() {
  const hashedPassword = await bcrypt.hash('12345', 10);
  await prisma.user.update({
    where: { id: 1 },
    data: { 
      email: 'mastur',
      password: hashedPassword
    }
  });
  console.log('Password for mastur updated to 12345');
}

reset().finally(() => prisma.$disconnect());
