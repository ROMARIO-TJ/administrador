import prisma from '../../../config/db.js';
import { inferHistoricalCycle, parseUtcDate, formatPeriodLabel } from '../../../utils/cycleUtils.js';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Reporte de Alumnos Morosos desde PostgreSQL en tiempo real
 * Consulta únicamente alumnos activos con mensualidades o inscripción pendientes según cobertura de ciclo.
 */
export async function getDebtorsReport(filters = {}) {
  const { categoryId, search } = filters;

  const today = parseUtcDate(new Date());
  const currentYear = today.getUTCFullYear();
  const currentMonth = today.getUTCMonth() + 1; // 1-12

  // Obtener tarifas vigentes de AcademySetting
  const settings = await prisma.academySetting.findFirst();
  const defaultRegFee = settings?.registrationFee ?? 50000.0;
  const defaultMonthlyFee = settings?.monthlyFee ?? 50000.0;

  const where = {
    status: 'ACTIVE'
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
      monthlyPayments: true
    }
  });

  const debtorsList = [];
  let totalPendingDebtSum = 0;
  let totalExpectedIncome = 0;
  let totalCollectedIncome = 0;

  for (const st of students) {
    const effectiveFee = st.customMonthlyFee ?? defaultMonthlyFee;

    totalExpectedIncome += defaultRegFee + (currentMonth * effectiveFee);

    let paidReg = st.registration ? st.registration.amount : 0;
    let paidMonthly = st.monthlyPayments.reduce((acc, p) => acc + p.amount, 0);
    totalCollectedIncome += (paidReg + paidMonthly);

    // Evaluar inscripción pendiente
    const isRegistrationPaid = !!st.registration;
    let pendingRegAmount = isRegistrationPaid ? 0 : defaultRegFee;

    // Procesar ciclos de mensualidades del alumno
    const processedPayments = st.monthlyPayments.map(p => {
      const { cycleStartDate, cycleEndDate } = inferHistoricalCycle(p, st.entryDate);
      return {
        ...p,
        cycleStartDate,
        cycleEndDate
      };
    }).sort((a, b) => b.cycleEndDate.getTime() - a.cycleEndDate.getTime());

    const lastPaidCycleEnd = processedPayments.length > 0 ? processedPayments[0].cycleEndDate : null;
    const pendingMonthsNames = [];

    // Evaluar si el ciclo actual está vencido
    if (!lastPaidCycleEnd) {
      const entryDate = st.entryDate ? parseUtcDate(st.entryDate) : today;
      if (today.getTime() >= entryDate.getTime()) {
        pendingMonthsNames.push(MONTH_NAMES[today.getUTCMonth()]);
      }
    } else {
      if (today.getTime() > lastPaidCycleEnd.getTime()) {
        pendingMonthsNames.push(MONTH_NAMES[today.getUTCMonth()]);
      }
    }

    const pendingMonthlyAmount = pendingMonthsNames.length * effectiveFee;
    const totalStudentPending = pendingRegAmount + pendingMonthlyAmount;

    if (totalStudentPending > 0) {
      totalPendingDebtSum += totalStudentPending;

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

      processedPayments.forEach(p => {
        allPayments.push({
          date: p.paymentDate,
          amount: p.amount,
          concept: `Mensualidad (${formatPeriodLabel(p.cycleStartDate, p.cycleEndDate)})`,
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
