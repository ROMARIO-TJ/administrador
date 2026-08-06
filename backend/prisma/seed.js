import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando carga de datos iniciales (seed)...');

  // Crear usuario administrador por defecto si no existe
  const adminEmail = 'admin@unionjaguera.com';
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail }
  });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        name: 'Administrador Unión Jaguera',
        role: 'ADMIN'
      }
    });
    console.log(`Usuario administrador creado con éxito: ${adminEmail}`);
  } else {
    console.log('El usuario administrador ya existe en la base de datos.');
  }

  // Crear configuración inicial de la academia si no existe
  const existingSettings = await prisma.academySetting.findFirst();
  if (!existingSettings) {
    await prisma.academySetting.create({
      data: {
        academyName: 'Unión Jaguera FC',
        address: 'La Jagua de Ibirico, Cesar, Colombia',
        phone: '+57 300 123 4567',
        email: 'contacto@unionjaguerafc.com',
        registrationFee: 50000.0,
        monthlyFee: 80000.0
      }
    });
    console.log('Configuración inicial de Unión Jaguera FC creada.');
  } else {
    console.log('La configuración de la academia ya existe.');
  }

  // Crear categorías por defecto de la academia si no existen
  const defaultCategories = [
    { name: 'Sub-6', description: 'Iniciación deportiva (4 a 6 años)' },
    { name: 'Sub-8', description: 'Pre-infantil (7 a 8 años)' },
    { name: 'Sub-10', description: 'Infantil A (9 a 10 años)' },
    { name: 'Sub-12', description: 'Infantil B (11 a 12 años)' },
    { name: 'Sub-14', description: 'Pre-juvenil (13 a 14 años)' },
    { name: 'Sub-16', description: 'Juvenil A (15 a 16 años)' },
    { name: 'Sub-18', description: 'Juvenil B (17 a 18 años)' },
    { name: 'Sub-20', description: 'Sub-20 (19 a 20 años)' },
    { name: 'Mayores', description: 'Categoría Superior / Mayores' }
  ];

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    });
  }
  console.log('Categorías por defecto verificadas/creadas con éxito.');
}

main()
  .catch((e) => {
    console.error('Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
