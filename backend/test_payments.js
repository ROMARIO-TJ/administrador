import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const payments = await prisma.monthlyPayment.findMany({ include: { student: true } });
  console.log(payments);
}
check().finally(() => prisma.$disconnect());
