import prisma from '../../../config/db.js';

/**
 * Reporte por Categorías (Métricas deportivas y de recaudo por grupo)
 */
export async function getCategoriesReport() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1; // 1-12

  const startOfMonth = new Date(currentYear, currentMonth - 1, 1);
  const endOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

  // Obtener tarifas vigentes de AcademySetting
  const settings = await prisma.academySetting.findFirst();
  const defaultMonthlyFee = settings?.monthlyFee ?? 50000.0;

  const categories = await prisma.category.findMany({
    include: {
      students: {
        include: {
          monthlyPayments: {
            where: { paymentDate: { gte: startOfMonth, lte: endOfMonth } }
          }
        }
      }
    },
    orderBy: { name: 'asc' }
  });

  const categoriesData = categories.map((cat) => {
    const totalStudents = cat.students.length;
    const activeStudents = cat.students.filter(s => s.status === 'ACTIVE').length;
    const inactiveStudents = cat.students.filter(s => s.status === 'INACTIVE').length;

    // Valor esperado mensual = suma de la tarifa efectiva de todos los alumnos activos
    const expectedMonthlyIncome = cat.students
      .filter(s => s.status === 'ACTIVE')
      .reduce((sum, s) => sum + (s.customMonthlyFee ?? defaultMonthlyFee), 0);

    // Valor recaudado este mes = suma de los pagos realizados en este mes por los alumnos de la categoría
    const collectedThisMonth = cat.students.reduce((sum, s) => {
      const monthSum = s.monthlyPayments.reduce((mSum, p) => mSum + p.amount, 0);
      return sum + monthSum;
    }, 0);

    const collectionPercentage = expectedMonthlyIncome > 0
      ? Math.round((collectedThisMonth / expectedMonthlyIncome) * 100)
      : 0;

    return {
      categoryId: cat.id,
      name: cat.name,
      description: cat.description,
      totalStudents,
      activeStudents,
      inactiveStudents,
      expectedMonthlyIncome,
      collectedThisMonth,
      collectionPercentage
    };
  });

  const grandTotalStudents = categoriesData.reduce((sum, c) => sum + c.totalStudents, 0);
  const grandActiveStudents = categoriesData.reduce((sum, c) => sum + c.activeStudents, 0);
  const grandInactiveStudents = categoriesData.reduce((sum, c) => sum + c.inactiveStudents, 0);
  const grandExpectedIncome = categoriesData.reduce((sum, c) => sum + c.expectedMonthlyIncome, 0);
  const grandCollectedIncome = categoriesData.reduce((sum, c) => sum + c.collectedThisMonth, 0);
  const grandCollectionPercentage = grandExpectedIncome > 0
    ? Math.round((grandCollectedIncome / grandExpectedIncome) * 100)
    : 0;

  return {
    categories: categoriesData,
    summary: {
      totalCategories: categoriesData.length,
      grandTotalStudents,
      grandActiveStudents,
      grandInactiveStudents,
      grandExpectedIncome,
      grandCollectedIncome,
      grandCollectionPercentage
    }
  };
}
