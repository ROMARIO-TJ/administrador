import { PrismaClient } from '@prisma/client';

/**
 * Cliente singleton de Prisma ORM
 */
const prisma = new PrismaClient();

export default prisma;
