import prisma from '../../../config/db.js';
import { PaymentsService } from '../../payments/payments.service.js';

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
 * Reporte Individual del Alumno (Ficha técnica y estado financiero completo)
 */
export async function getStudentIndividualReport(studentId) {
  const id = parseInt(studentId);
  if (!id || isNaN(id)) {
    throw new Error('ID de alumno no válido');
  }

  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      category: true,
      registration: true,
      monthlyPayments: {
        orderBy: { paymentDate: 'desc' }
      }
    }
  });

  if (!student) {
    throw new Error('Alumno no encontrado');
  }

  const age = calculateAge(student.birthDate);
  const financialStatus = await PaymentsService.getStudentFinancialStatus(id);

  return {
    studentInfo: {
      id: student.id,
      code: `ALU-${String(student.id).padStart(4, '0')}`,
      photo: student.photo,
      firstName: student.firstName,
      lastName: student.lastName,
      fullName: `${student.firstName} ${student.lastName}`,
      document: student.document,
      birthDate: student.birthDate,
      age,
      gender: student.gender,
      position: student.position,
      dominantFoot: student.dominantFoot,
      jerseyNumber: student.jerseyNumber,
      categoryId: student.categoryId,
      categoryName: student.category ? student.category.name : 'Sin asignación',
      entryDate: student.entryDate,
      status: student.status,
      guardianName: student.guardianName,
      guardianRelationship: student.guardianRelationship,
      guardianPhone: student.guardianPhone,
      guardianAddress: student.guardianAddress,
      eps: student.eps,
      allergies: student.allergies,
      medicalNotes: student.medicalNotes,
      generalNotes: student.generalNotes,
      customMonthlyFee: student.customMonthlyFee
    },
    financialStatus
  };
}
