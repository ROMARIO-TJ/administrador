import prisma from '../../../config/db.js';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Reporte de Mensualidades (Matriz Anual Ene-Dic) desde PostgreSQL en tiempo real
 */
export async function getMonthlyReport(filters = {}) {
  const { categoryId, year, search } = filters;

  const targetYear = year ? parseInt(year) : new Date().getFullYear();
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const where = {};

  if (categoryId && !isNaN(Number(categoryId))) {
    where.categoryId = Number(categoryId);
  }

  if (search && search.trim()) {
    const query = search.trim();
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { document: { contains: query, mode: 'insensitive' } }
    ];
  }

  const students = await prisma.student.findMany({
    where,
    include: {
      category: { select: { name: true } },
      monthlyPayments: {
        where: { year: targetYear }
      }
    },
    orderBy: [
      { categoryId: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' }
    ]
  });

  let totalPaidMonths = 0;
  let totalPendingMonths = 0;
  let totalOverdueMonths = 0;

  const reportMatrix = students.map((st) => {
    const paymentsMap = new Map();
    st.monthlyPayments.forEach(p => {
      paymentsMap.set(p.month, p);
    });

    const months = Array.from({ length: 12 }, (_, index) => {
      const monthNum = index + 1;
      const payment = paymentsMap.get(monthNum) || null;
      const isPaid = !!payment;

      let status = 'FUTURE'; // 🔵 Próximo
      if (isPaid) {
        status = 'PAID'; // 🟢 Pagado
        totalPaidMonths++;
      } else if (targetYear < currentYear || (targetYear === currentYear && monthNum < currentMonth)) {
        status = 'OVERDUE'; // 🔴 Vencido
        totalOverdueMonths++;
      } else if (targetYear === currentYear && monthNum === currentMonth) {
        status = 'PENDING'; // 🟡 Pendiente
        totalPendingMonths++;
      }

      return {
        month: monthNum,
        monthName: MONTH_NAMES[index],
        status,
        isPaid,
        amount: payment ? payment.amount : null,
        consecutive: payment ? payment.consecutive : null,
        paymentDate: payment ? payment.paymentDate : null
      };
    });

    return {
      studentId: st.id,
      code: `ALU-${String(st.id).padStart(4, '0')}`,
      fullName: `${st.firstName} ${st.lastName}`,
      document: st.document,
      categoryName: st.category ? st.category.name : 'Sin asignación',
      status: st.status,
      months
    };
  });

  const summary = {
    targetYear,
    totalStudents: students.length,
    totalPaidMonths,
    totalPendingMonths,
    totalOverdueMonths
  };

  return {
    year: targetYear,
    matrix: reportMatrix,
    summary
  };
}
