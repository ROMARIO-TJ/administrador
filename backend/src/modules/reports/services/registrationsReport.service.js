import prisma from '../../../config/db.js';

/**
 * Reporte de Inscripciones / Matrículas desde PostgreSQL en tiempo real
 */
export async function getRegistrationsReport(filters = {}) {
  const { startDate, endDate, search, paymentMethod } = filters;

  const where = {};

  if (paymentMethod && paymentMethod !== 'ALL') {
    where.paymentMethod = paymentMethod;
  }

  if (startDate || endDate) {
    where.paymentDate = {};
    if (startDate) {
      where.paymentDate.gte = new Date(startDate);
    }
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      where.paymentDate.lte = eDate;
    }
  }

  if (search && search.trim()) {
    const query = search.trim();
    where.OR = [
      { consecutive: { contains: query, mode: 'insensitive' } },
      {
        student: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { document: { contains: query, mode: 'insensitive' } }
          ]
        }
      }
    ];
  }

  const registrations = await prisma.registration.findMany({
    where,
    include: {
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          document: true,
          category: { select: { name: true } }
        }
      }
    },
    orderBy: { paymentDate: 'desc' }
  });

  const formattedRegistrations = registrations.map(r => ({
    id: r.id,
    consecutive: r.consecutive,
    studentId: r.studentId,
    studentName: r.student ? `${r.student.firstName} ${r.student.lastName}` : 'N/A',
    studentDocument: r.student ? r.student.document : 'N/A',
    categoryName: r.student?.category?.name || 'Sin asignación',
    amount: r.amount,
    paymentDate: r.paymentDate,
    paymentMethod: r.paymentMethod,
    notes: r.notes,
    registeredBy: r.registeredBy
  }));

  const totalAmountCollected = formattedRegistrations.reduce((sum, r) => sum + r.amount, 0);

  return {
    registrations: formattedRegistrations,
    summary: {
      totalCount: formattedRegistrations.length,
      totalAmountCollected
    }
  };
}
