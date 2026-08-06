import prisma from '../../../config/db.js';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Reporte General de Movimientos (Libro Diario Financiero)
 * Combina Inscripciones y Mensualidades en orden cronológico descendente.
 */
export async function getMovementsReport(filters = {}) {
  const { startDate, endDate, studentId, type, paymentMethod, search } = filters;

  let registrations = [];
  let monthlyPayments = [];

  const studentWhere = {};
  if (studentId) {
    studentWhere.id = parseInt(studentId);
  }
  if (search && search.trim()) {
    const query = search.trim();
    studentWhere.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { document: { contains: query, mode: 'insensitive' } }
    ];
  }

  const baseDateWhere = {};
  if (startDate || endDate) {
    if (startDate) baseDateWhere.gte = new Date(startDate);
    if (endDate) {
      const eDate = new Date(endDate);
      eDate.setHours(23, 59, 59, 999);
      baseDateWhere.lte = eDate;
    }
  }

  // Cargar Inscripciones si aplica
  if (!type || type === 'ALL' || type === 'INSCRIPCION') {
    const regWhere = {};
    if (paymentMethod && paymentMethod !== 'ALL') {
      regWhere.paymentMethod = paymentMethod;
    }
    if (startDate || endDate) {
      regWhere.paymentDate = baseDateWhere;
    }
    if (studentId || (search && search.trim())) {
      regWhere.student = studentWhere;
    }
    if (search && search.trim()) {
      regWhere.OR = [
        { consecutive: { contains: search.trim(), mode: 'insensitive' } },
        { student: studentWhere }
      ];
    }

    registrations = await prisma.registration.findMany({
      where: regWhere,
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
  }

  // Cargar Mensualidades si aplica
  if (!type || type === 'ALL' || type === 'MENSUALIDAD') {
    const monthWhere = {};
    if (paymentMethod && paymentMethod !== 'ALL') {
      monthWhere.paymentMethod = paymentMethod;
    }
    if (startDate || endDate) {
      monthWhere.paymentDate = baseDateWhere;
    }
    if (studentId || (search && search.trim())) {
      monthWhere.student = studentWhere;
    }
    if (search && search.trim()) {
      monthWhere.OR = [
        { consecutive: { contains: search.trim(), mode: 'insensitive' } },
        { student: studentWhere }
      ];
    }

    monthlyPayments = await prisma.monthlyPayment.findMany({
      where: monthWhere,
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
  }

  const formattedRegistrations = registrations.map(r => ({
    id: `REG-${r.id}`,
    rawId: r.id,
    type: 'INSCRIPCION',
    concept: 'Pago de Inscripción',
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

  const formattedMonthly = monthlyPayments.map(m => ({
    id: `MEN-${m.id}`,
    rawId: m.id,
    type: 'MENSUALIDAD',
    concept: `Mensualidad ${MONTH_NAMES[m.month - 1]} ${m.year}`,
    consecutive: m.consecutive,
    studentId: m.studentId,
    studentName: m.student ? `${m.student.firstName} ${m.student.lastName}` : 'N/A',
    studentDocument: m.student ? m.student.document : 'N/A',
    categoryName: m.student?.category?.name || 'Sin asignación',
    amount: m.amount,
    paymentDate: m.paymentDate,
    paymentMethod: m.paymentMethod,
    notes: m.notes,
    registeredBy: m.registeredBy
  }));

  const movements = [...formattedRegistrations, ...formattedMonthly];
  movements.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

  const totalAmount = movements.reduce((sum, m) => sum + m.amount, 0);

  return {
    movements,
    summary: {
      totalMovements: movements.length,
      registrationCount: formattedRegistrations.length,
      monthlyCount: formattedMonthly.length,
      totalAmount
    }
  };
}
