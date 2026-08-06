import prisma from '../../config/db.js';

export class DashboardService {
  /**
   * Obtener métricas estadísticas reales del Dashboard en tiempo real
   */
  static async getStats() {
    const [activeStudents, inactiveStudents, totalCategories] = await Promise.all([
      prisma.student.count({ where: { status: 'ACTIVE' } }),
      prisma.student.count({ where: { status: 'INACTIVE' } }),
      prisma.category.count()
    ]);

    const totalStudents = activeStudents + inactiveStudents;

    return {
      totalStudents,
      activeStudents,
      inactiveStudents,
      totalCategories,
      monthlyPayments: 0, // Se implementará en el Sprint 3
      pendingMonthlyFees: 0, // Se implementará en el Sprint 3
      monthlyIncome: 0.0 // Se implementará en el Sprint 3
    };
  }
}
