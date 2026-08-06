import prisma from '../../../config/db.js';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Reporte de Alumnos Morosos desde PostgreSQL en tiempo real
 * Consulta únicamente alumnos con mensualidades o inscripción pendientes.
 */
export async function getDebtorsReport(filters = {}) {
  const { categoryId, search } = filters;

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  // Obtener tarifas vigentes de AcademySetting
  const settings = await prisma.academySetting.findFirst();
  const defaultRegFee = settings?.registrationFee ?? 50000.0;
  const defaultMonthlyFee = settings?.monthlyFee ?? 50000.0;

  const where = {
    status: 'ACTIVE' // Por defecto se evalúan alumnos activos
  };

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
      registration: true,
      monthlyPayments: {
        where: { year: currentYear }
      }
    }
  });

  const debtorsList = [];
  let totalPendingDebtSum = 0;
  let totalExpectedIncome = 0;
  let totalCollectedIncome = 0;

  for (const st of students) {
    const effectiveFee = st.customMonthlyFee ?? defaultMonthlyFee;

    // Sumatoria de esperado y recaudado para métricas
    totalExpectedIncome += defaultRegFee + (currentMonth * effectiveFee);

    let paidReg = st.registration ? st.registration.amount : 0;
    let paidMonthly = st.monthlyPayments.reduce((acc, p) => acc + p.amount, 0);
    totalCollectedIncome += (paidReg + paidMonthly);

    // Evaluar inscripción pendiente
    const isRegistrationPaid = !!st.registration;
    let pendingRegAmount = isRegistrationPaid ? 0 : defaultRegFee;

    // Evaluar mensualidades pendientes de meses transcurridos en el año actual
    const paidMonthsSet = new Set(st.monthlyPayments.map(p => p.month));
    const pendingMonthsNames = [];

    for (let m = 1; m <= currentMonth; m++) {
      if (!paidMonthsSet.has(m)) {
        pendingMonthsNames.push(MONTH_NAMES[m - 1]);
      }
    }

    const pendingMonthlyAmount = pendingMonthsNames.length * effectiveFee;
    const totalStudentPending = pendingRegAmount + pendingMonthlyAmount;

    if (totalStudentPending > 0) {
      totalPendingDebtSum += totalStudentPending;

      // Determinar el último pago realizado por el alumno
      let lastPayment = null;
      const allPayments = [];

      if (st.registration) {
        allPayments.push({
          date: st.registration.paymentDate,
          amount: st.registration.amount,
          concept: 'Inscripción',
          consecutive: st.registration.consecutive
        });
      }

      st.monthlyPayments.forEach(p => {
        allPayments.push({
          date: p.paymentDate,
          amount: p.amount,
          concept: `Mensualidad ${MONTH_NAMES[p.month - 1]} ${p.year}`,
          consecutive: p.consecutive
        });
      });

      if (allPayments.length > 0) {
        allPayments.sort((a, b) => new Date(b.date) - new Date(a.date));
        lastPayment = allPayments[0];
      }

      debtorsList.push({
        studentId: st.id,
        code: `ALU-${String(st.id).padStart(4, '0')}`,
        fullName: `${st.firstName} ${st.lastName}`,
        document: st.document,
        categoryName: st.category ? st.category.name : 'Sin asignación',
        guardianName: st.guardianName,
        guardianPhone: st.guardianPhone,
        isRegistrationPaid,
        pendingMonths: pendingMonthsNames,
        pendingMonthsCount: pendingMonthsNames.length,
        effectiveFee,
        totalPending: totalStudentPending,
        lastPayment
      });
    }
  }

  // Ordenar de mayor a menor deuda
  debtorsList.sort((a, b) => b.totalPending - a.totalPending);

  return {
    debtors: debtorsList,
    summary: {
      totalDebtorsCount: debtorsList.length,
      totalPendingDebt: totalPendingDebtSum,
      totalExpectedIncome,
      totalCollectedIncome,
      collectionPercentage: totalExpectedIncome > 0
        ? Math.round((totalCollectedIncome / totalExpectedIncome) * 100)
        : 0
    }
  };
}
