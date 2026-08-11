import prisma from '../../../config/db.js';

/**
 * Reporte de Ingresos Financieros desde PostgreSQL en tiempo real
 * Calcula montos exactos para Hoy, Semana, Mes, Año y Rango personalizado
 */
export async function getIncomeReport(filters = {}) {
  const { period = 'month', startDate, endDate } = filters;

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  // Fecha Inicio y Fin del Día de hoy (UTC Boundaries)
  const startOfToday = new Date(Date.UTC(year, month, date));
  const endOfToday = new Date(Date.UTC(year, month, date + 1));

  // Fecha Inicio y Fin de la Semana (Lunes a Domingo)
  const dayOfWeek = now.getDay();
  const diffToMonday = (dayOfWeek === 0 ? -6 : 1) - dayOfWeek;
  const startOfWeek = new Date(Date.UTC(year, month, date + diffToMonday));
  const endOfWeek = new Date(Date.UTC(year, month, date + diffToMonday + 7));

  // Fecha Inicio y Fin del Mes
  const startOfMonth = new Date(Date.UTC(year, month, 1));
  const endOfMonth = new Date(Date.UTC(year, month + 1, 1));

  // Fecha Inicio y Fin del Año
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const endOfYear = new Date(Date.UTC(year + 1, 0, 1));

  // Determinar rango para el filtro seleccionado
  let filterStart = startOfMonth;
  let filterEnd = endOfMonth;

  if (period === 'today') {
    filterStart = startOfToday;
    filterEnd = endOfToday;
  } else if (period === 'week') {
    filterStart = startOfWeek;
    filterEnd = endOfWeek;
  } else if (period === 'year') {
    filterStart = startOfYear;
    filterEnd = endOfYear;
  } else if (period === 'custom' && startDate && endDate) {
    filterStart = new Date(startDate);
    const end = new Date(endDate);
    filterEnd = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate() + 1));
  }

  // Agregaciones fijas para KPIs de la parte superior
  const [
    todayReg, todayMon,
    weekReg, weekMon,
    monthReg, monthMon,
    yearReg, yearMon,
    totalReg, totalMon,
    // Registros detallados dentro del filtro seleccionado
    filteredRegs, filteredMonths
  ] = await Promise.all([
    // Hoy
    prisma.registration.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: startOfToday, lt: endOfToday } } }),
    prisma.monthlyPayment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: startOfToday, lt: endOfToday } } }),
    // Semana
    prisma.registration.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: startOfWeek, lt: endOfWeek } } }),
    prisma.monthlyPayment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: startOfWeek, lt: endOfWeek } } }),
    // Mes
    prisma.registration.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: startOfMonth, lt: endOfMonth } } }),
    prisma.monthlyPayment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: startOfMonth, lt: endOfMonth } } }),
    // Año
    prisma.registration.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: startOfYear, lt: endOfYear } } }),
    prisma.monthlyPayment.aggregate({ _sum: { amount: true }, where: { paymentDate: { gte: startOfYear, lt: endOfYear } } }),
    // Total histórico
    prisma.registration.aggregate({ _sum: { amount: true } }),
    prisma.monthlyPayment.aggregate({ _sum: { amount: true } }),

    // Detalle filtrado
    prisma.registration.findMany({
      where: { paymentDate: { gte: filterStart, lt: filterEnd } },
      include: { student: { select: { firstName: true, lastName: true, document: true } } }
    }),
    prisma.monthlyPayment.findMany({
      where: { paymentDate: { gte: filterStart, lt: filterEnd } },
      include: { student: { select: { firstName: true, lastName: true, document: true } } }
    })
  ]);

  const todayIncome = (todayReg._sum.amount || 0) + (todayMon._sum.amount || 0);
  const weekIncome = (weekReg._sum.amount || 0) + (weekMon._sum.amount || 0);
  const monthIncome = (monthReg._sum.amount || 0) + (monthMon._sum.amount || 0);
  const yearIncome = (yearReg._sum.amount || 0) + (yearMon._sum.amount || 0);
  const totalIncome = (totalReg._sum.amount || 0) + (totalMon._sum.amount || 0);

  // Desglose por método de pago dentro del rango filtrado
  const methodsMap = {
    EFECTIVO: 0,
    TRANSFERENCIA: 0,
    NEQUI: 0,
    DAVIPLATA: 0,
    OTRO: 0
  };

  let filterRegSum = 0;
  let filterMonSum = 0;

  filteredRegs.forEach(r => {
    filterRegSum += r.amount;
    const method = r.paymentMethod || 'EFECTIVO';
    methodsMap[method] = (methodsMap[method] || 0) + r.amount;
  });

  filteredMonths.forEach(m => {
    filterMonSum += m.amount;
    const method = m.paymentMethod || 'EFECTIVO';
    methodsMap[method] = (methodsMap[method] || 0) + m.amount;
  });

  const filterTotalIncome = filterRegSum + filterMonSum;

  return {
    kpis: {
      todayIncome,
      weekIncome,
      monthIncome,
      yearIncome,
      totalIncome
    },
    filteredPeriod: {
      period,
      startDate: filterStart,
      endDate: filterEnd,
      totalCollected: filterTotalIncome,
      registrationsAmount: filterRegSum,
      monthlyPaymentsAmount: filterMonSum,
      byMethod: methodsMap
    }
  };
}
