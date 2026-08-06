import prisma from '../../config/db.js';

/**
 * Calcula la edad exacta en años a partir de la fecha de nacimiento.
 * NO se almacena en BD.
 */

export const calculateAge = (birthDate) => {
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

export class StudentsService {
  /**
   * Obtener configuración predeterminada de la academia para la cuota mensual
   */
  static async getDefaultMonthlyFee() {
    const settings = await prisma.academySetting.findFirst();
    return settings ? settings.monthlyFee : 80000.0;
  }

  /**
   * Obtener listado de alumnos con búsqueda y filtros
   */
  static async getAllStudents(filters = {}) {
    const { search, categoryId, status } = filters;

    const where = {};

    // Filtro por Estado
    if (status && (status === 'ACTIVE' || status === 'INACTIVE')) {
      where.status = status;
    }

    // Filtro por Categoría
    if (categoryId && !isNaN(Number(categoryId))) {
      where.categoryId = Number(categoryId);
    }

    // Buscador en tiempo real por Nombres, Apellidos o Documento
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
        category: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const defaultMonthlyFee = await this.getDefaultMonthlyFee();

    // Mapeo con edad calculada y cuota mensual efectiva
    return students.map((student) => {
      const age = calculateAge(student.birthDate);
      const isCustomFee = student.customMonthlyFee !== null && student.customMonthlyFee !== undefined;
      const effectiveMonthlyFee = isCustomFee ? student.customMonthlyFee : defaultMonthlyFee;

      return {
        ...student,
        age,
        isCustomFee,
        effectiveMonthlyFee,
        defaultMonthlyFee
      };
    });
  }

  /**
   * Obtener un alumno por su ID con todos sus detalles
   */
  static async getStudentById(id) {
    const studentId = Number(id);

    if (isNaN(studentId)) {
      const error = new Error('ID de alumno no válido');
      error.statusCode = 400;
      throw error;
    }

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        category: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!student) {
      const error = new Error('Alumno no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const defaultMonthlyFee = await this.getDefaultMonthlyFee();
    const age = calculateAge(student.birthDate);
    const isCustomFee = student.customMonthlyFee !== null && student.customMonthlyFee !== undefined;
    const effectiveMonthlyFee = isCustomFee ? student.customMonthlyFee : defaultMonthlyFee;

    return {
      ...student,
      age,
      isCustomFee,
      effectiveMonthlyFee,
      defaultMonthlyFee
    };
  }

  /**
   * Crear un nuevo alumno
   */
  static async createStudent(data) {
    const {
      photo,
      firstName,
      lastName,
      document,
      birthDate,
      gender,
      categoryId,
      entryDate,
      position,
      dominantFoot,
      jerseyNumber,
      guardianName,
      guardianRelationship,
      guardianPhone,
      guardianAddress,
      eps,
      allergies,
      medicalNotes,
      generalNotes,
      useCustomFee,
      customMonthlyFee
    } = data;

    const studentData = {
      photo: photo ? photo.trim() : null,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      document: document.trim(),
      birthDate: new Date(birthDate),
      gender,
      categoryId: Number(categoryId),
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      position,
      dominantFoot,
      jerseyNumber: jerseyNumber !== undefined && jerseyNumber !== null && jerseyNumber !== '' ? Number(jerseyNumber) : null,
      guardianName: guardianName.trim(),
      guardianRelationship: guardianRelationship.trim(),
      guardianPhone: guardianPhone.trim(),
      guardianAddress: guardianAddress.trim(),
      eps: eps.trim(),
      allergies: allergies ? allergies.trim() : null,
      medicalNotes: medicalNotes ? medicalNotes.trim() : null,
      generalNotes: generalNotes ? generalNotes.trim() : null,
      customMonthlyFee: useCustomFee && customMonthlyFee !== null && customMonthlyFee !== undefined && customMonthlyFee !== ''
        ? parseFloat(customMonthlyFee)
        : null,
      status: 'ACTIVE'
    };

    const newStudent = await prisma.student.create({
      data: studentData,
      include: { category: true }
    });

    return await this.getStudentById(newStudent.id);
  }

  /**
   * Actualizar información de un alumno
   */
  static async updateStudent(id, data) {
    const studentId = Number(id);
    await this.getStudentById(studentId);

    const {
      photo,
      firstName,
      lastName,
      document,
      birthDate,
      gender,
      categoryId,
      entryDate,
      position,
      dominantFoot,
      jerseyNumber,
      guardianName,
      guardianRelationship,
      guardianPhone,
      guardianAddress,
      eps,
      allergies,
      medicalNotes,
      generalNotes,
      useCustomFee,
      customMonthlyFee,
      status
    } = data;

    const updateData = {};

    if (photo !== undefined) updateData.photo = photo ? photo.trim() : null;
    if (firstName) updateData.firstName = firstName.trim();
    if (lastName) updateData.lastName = lastName.trim();
    if (document) updateData.document = document.trim();
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (gender) updateData.gender = gender;
    if (categoryId) updateData.categoryId = Number(categoryId);
    if (entryDate) updateData.entryDate = new Date(entryDate);
    if (position) updateData.position = position;
    if (dominantFoot) updateData.dominantFoot = dominantFoot;

    if (jerseyNumber !== undefined) {
      updateData.jerseyNumber = jerseyNumber !== null && jerseyNumber !== '' ? Number(jerseyNumber) : null;
    }

    if (guardianName) updateData.guardianName = guardianName.trim();
    if (guardianRelationship) updateData.guardianRelationship = guardianRelationship.trim();
    if (guardianPhone) updateData.guardianPhone = guardianPhone.trim();
    if (guardianAddress) updateData.guardianAddress = guardianAddress.trim();
    if (eps) updateData.eps = eps.trim();

    if (allergies !== undefined) updateData.allergies = allergies ? allergies.trim() : null;
    if (medicalNotes !== undefined) updateData.medicalNotes = medicalNotes ? medicalNotes.trim() : null;
    if (generalNotes !== undefined) updateData.generalNotes = generalNotes ? generalNotes.trim() : null;

    if (useCustomFee !== undefined) {
      if (useCustomFee && customMonthlyFee !== null && customMonthlyFee !== undefined && customMonthlyFee !== '') {
        updateData.customMonthlyFee = parseFloat(customMonthlyFee);
      } else {
        updateData.customMonthlyFee = null;
      }
    } else if (customMonthlyFee !== undefined) {
      updateData.customMonthlyFee = customMonthlyFee !== null ? parseFloat(customMonthlyFee) : null;
    }

    if (status) updateData.status = status;

    await prisma.student.update({
      where: { id: studentId },
      data: updateData
    });

    return await this.getStudentById(studentId);
  }

  /**
   * Cambiar estado de un alumno (ACTIVE <-> INACTIVE)
   */
  static async updateStudentStatus(id, newStatus) {
    const studentId = Number(id);
    await this.getStudentById(studentId);

    if (!['ACTIVE', 'INACTIVE'].includes(newStatus)) {
      const error = new Error('El estado debe ser ACTIVE o INACTIVE');
      error.statusCode = 400;
      throw error;
    }

    await prisma.student.update({
      where: { id: studentId },
      data: { status: newStatus }
    });

    return await this.getStudentById(studentId);
  }

  /**
   * Borrado Lógico de alumno (asigna status = INACTIVE)
   */
  static async deleteStudentLogical(id) {
    return await this.updateStudentStatus(id, 'INACTIVE');
  }

  /**
   * Eliminación Definitiva (Física) de alumno de PostgreSQL.
   * REGLA DE INTEGRIDAD REFERENCIAL: Si el alumno posee información registrada en otros módulos,
   * la eliminación física es denegada y debe mantenerse como INACTIVO.
   */
  static async deleteStudentPhysical(id) {
    const studentId = Number(id);
    const student = await this.getStudentById(studentId);

    // Verificar si existen relaciones contables (Pagos) u otras entidades asociadas
    const paymentsCount = await prisma.payment.count({
      where: { studentId }
    });

    if (paymentsCount > 0) {
      const error = new Error('No es posible eliminar físicamente al alumno porque posee registros relacionados en el sistema (pagos, asistencias u otro historial). Para proteger la integridad de la información, el alumno debe mantenerse en estado Inactivo.');
      error.statusCode = 400;
      throw error;
    }

    // Si no existen relaciones, se elimina físicamente de PostgreSQL
    await prisma.student.delete({
      where: { id: studentId }
    });

    return { id: studentId, deleted: true };
  }
}
