import prisma from '../../../config/db.js';

const calculateAge = (birthDate) => {
  if (!birthDate) return 0;
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : 0;
};

/**
 * Reporte General de Alumnos desde PostgreSQL en tiempo real
 */
export async function getStudentsReport(filters = {}) {
  const { categoryId, status, gender, minAge, maxAge, year, search } = filters;

  const where = {};

  if (status && (status === 'ACTIVE' || status === 'INACTIVE')) {
    where.status = status;
  }

  if (gender) {
    where.gender = gender;
  }

  if (categoryId && !isNaN(Number(categoryId))) {
    where.categoryId = Number(categoryId);
  }

  if (year && !isNaN(Number(year))) {
    const startOfYear = new Date(Number(year), 0, 1);
    const endOfYear = new Date(Number(year), 11, 31, 23, 59, 59);
    where.entryDate = {
      gte: startOfYear,
      lte: endOfYear
    };
  }

  if (search && search.trim()) {
    const query = search.trim();
    where.OR = [
      { firstName: { contains: query, mode: 'insensitive' } },
      { lastName: { contains: query, mode: 'insensitive' } },
      { document: { contains: query, mode: 'insensitive' } }
    ];
  }

  const rawStudents = await prisma.student.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } },
      registration: { select: { id: true, consecutive: true, paymentDate: true } }
    },
    orderBy: [
      { categoryId: 'asc' },
      { lastName: 'asc' },
      { firstName: 'asc' }
    ]
  });

  // Mapear con cálculos y filtros por edad si aplican
  let students = rawStudents.map((st) => {
    const age = calculateAge(st.birthDate);
    return {
      id: st.id,
      code: `ALU-${String(st.id).padStart(4, '0')}`,
      photo: st.photo,
      fullName: `${st.firstName} ${st.lastName}`,
      firstName: st.firstName,
      lastName: st.lastName,
      document: st.document,
      birthDate: st.birthDate,
      age,
      gender: st.gender,
      position: st.position,
      dominantFoot: st.dominantFoot,
      jerseyNumber: st.jerseyNumber,
      categoryId: st.categoryId,
      categoryName: st.category ? st.category.name : 'Sin asignación',
      entryDate: st.entryDate,
      status: st.status,
      guardianName: st.guardianName,
      guardianRelationship: st.guardianRelationship,
      guardianPhone: st.guardianPhone,
      guardianAddress: st.guardianAddress,
      eps: st.eps,
      hasRegistration: !!st.registration,
      registrationConsecutive: st.registration?.consecutive || null
    };
  });

  if (minAge && !isNaN(Number(minAge))) {
    students = students.filter(s => s.age >= Number(minAge));
  }

  if (maxAge && !isNaN(Number(maxAge))) {
    students = students.filter(s => s.age <= Number(maxAge));
  }

  // Resumen estadístico
  const summary = {
    totalStudents: students.length,
    activeCount: students.filter(s => s.status === 'ACTIVE').length,
    inactiveCount: students.filter(s => s.status === 'INACTIVE').length,
    maleCount: students.filter(s => s.gender === 'MASCULINO').length,
    femaleCount: students.filter(s => s.gender === 'FEMENINO').length
  };

  return {
    students,
    summary
  };
}
