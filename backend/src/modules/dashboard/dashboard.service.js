import prisma from '../../config/db.js';

export class DashboardService {
  /**
   * Obtener métricas estadísticas y financieras reales del Dashboard desde PostgreSQL
   */
  static async getStats() {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed para JavaScript

    const startOfMonth = new Date(Date.UTC(currentYear, currentMonth, 1, 0, 0, 0, 0));
    const endOfMonth = new Date(Date.UTC(currentYear, currentMonth + 1, 0, 23, 59, 59, 999));

    const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0, 0));
    const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

    // Consultas concurrentes en PostgreSQL
    const [
      activeStudents,
      inactiveStudents,
      totalCategories,
      // Recaudo del Mes
      regMonthSum,
      monthlyMonthSum,
      // Recaudo del Año
      regYearSum,
      monthlyYearSum,
      // Total Inscripciones
      totalRegCount,
      totalRegSum,
      // Total Mensualidades
      totalMonthlyCount,
      totalMonthlySum
    ] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.student.count({ where: { status: 'INACTIVE' } }),
      prisma.category.count(),

      // Inscripciones este mes
      prisma.registration.aggregate({
        _sum: { amount: true },
        where: { paymentDate: { gte: startOfMonth, lte: endOfMonth } }
      }),
      // Mensualidades este mes
      prisma.monthlyPayment.aggregate({
        _sum: { amount: true },
        where: { paymentDate: { gte: startOfMonth, lte: endOfMonth } }
      }),

      // Inscripciones este año
      prisma.registration.aggregate({
        _sum: { amount: true },
        where: { paymentDate: { gte: startOfYear, lte: endOfYear } }
      }),
      // Mensualidades este año
      prisma.monthlyPayment.aggregate({
        _sum: { amount: true },
        where: { paymentDate: { gte: startOfYear, lte: endOfYear } }
      }),

      // Totales generales de Inscripciones
      prisma.registration.count(),
      prisma.registration.aggregate({ _sum: { amount: true } }),

      // Totales generales de Mensualidades
      prisma.monthlyPayment.count(),
      prisma.monthlyPayment.aggregate({ _sum: { amount: true } })
    ]);

    const totalStudents = activeStudents + inactiveStudents;

    const recaudoMes = (regMonthSum._sum.amount || 0) + (monthlyMonthSum._sum.amount || 0);
    const recaudoAño = (regYearSum._sum.amount || 0) + (monthlyYearSum._sum.amount || 0);

    const totalInscripcionesMonto = totalRegSum._sum.amount || 0;
    const totalMensualidadesMonto = totalMonthlySum._sum.amount || 0;

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalCategories,
      // Indicadores Financieros en Tiempo Real
      recaudoMes,
      recaudoAño,
      totalMensualidades: totalMensualidadesMonto,
      totalMensualidadesCount: totalMonthlyCount,
      totalInscripciones: totalInscripcionesMonto,
      totalInscripcionesCount: totalRegCount,
      // Alias de compatibilidad
      monthlyIncome: recaudoMes,
      yearlyIncome: recaudoAño,
      monthlyPayments: totalMonthlyCount
    };
  }
}
