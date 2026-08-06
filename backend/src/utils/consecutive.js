/**
 * Genera de forma incremental y atómica el siguiente consecutivo de pago
 * Ejemplo: INS-000001, MEN-000001
 * 
 * @param {Object} prisma - Instancia de Prisma Client
 * @param {string} name - Nombre del consecutivo ('REGISTRATION' | 'MONTHLY_PAYMENT')
 * @param {string} prefix - Prefijo del consecutivo ('INS-' | 'MEN-')
 * @returns {Promise<string>} Consecutivo formateado (ej. 'INS-000001')
 */
export async function getNextConsecutive(prisma, name, prefix) {
  // Se obtiene o se inicializa el registro del consecutivo
  const consecutive = await prisma.consecutive.upsert({
    where: { name },
    update: {
      currentValue: { increment: 1 }
    },
    create: {
      name,
      prefix,
      currentValue: 1
    }
  });

  const paddedNumber = String(consecutive.currentValue).padStart(6, '0');
  return `${consecutive.prefix}${paddedNumber}`;
}
