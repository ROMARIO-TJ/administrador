import prisma from '../../config/db.js';

export class StudentsValidation {
  static async validateCreate(data) {
    const errors = {};

    const requiredFields = [
      { field: 'firstName', label: 'Nombres' },
      { field: 'lastName', label: 'Apellidos' },
      { field: 'document', label: 'Documento de identidad' },
      { field: 'birthDate', label: 'Fecha de nacimiento' },
      { field: 'gender', label: 'Sexo' },
      { field: 'categoryId', label: 'Categoría' },
      { field: 'entryDate', label: 'Fecha de ingreso' },
      { field: 'position', label: 'Posición' },
      { field: 'dominantFoot', label: 'Pie dominante' },
      { field: 'guardianName', label: 'Nombre del acudiente' },
      { field: 'guardianRelationship', label: 'Parentesco del acudiente' },
      { field: 'guardianPhone', label: 'Teléfono del acudiente' },
      { field: 'guardianAddress', label: 'Dirección del acudiente' },
      { field: 'eps', label: 'EPS' }
    ];

    for (const item of requiredFields) {
      const val = data[item.field];
      if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
        errors[item.field] = `El campo ${item.label} es obligatorio`;
      }
    }

    // Validar unicidad de documento
    if (data.document && data.document.trim()) {
      const existing = await prisma.student.findUnique({
        where: { document: data.document.trim() }
      });
      if (existing) {
        errors.document = 'Ya existe un alumno registrado con este número de documento';
      }
    }

    // Validar categoría existente
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: Number(data.categoryId) }
      });
      if (!category) {
        errors.categoryId = 'La categoría seleccionada no existe';
      }
    }

    // Validar Enums
    const validGenders = ['MASCULINO', 'FEMENINO', 'OTRO'];
    if (data.gender && !validGenders.includes(data.gender)) {
      errors.gender = `El sexo debe ser uno de los siguientes valores: ${validGenders.join(', ')}`;
    }

    const validDominantFeet = ['DERECHO', 'IZQUIERDO', 'AMBIDIESTRO'];
    if (data.dominantFoot && !validDominantFeet.includes(data.dominantFoot)) {
      errors.dominantFoot = `El pie dominante debe ser uno de los siguientes valores: ${validDominantFeet.join(', ')}`;
    }

    const validPositions = ['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO'];
    if (data.position && !validPositions.includes(data.position)) {
      errors.position = `La posición debe ser una de las siguientes: ${validPositions.join(', ')}`;
    }

    // Validar fechas
    if (data.birthDate && isNaN(Date.parse(data.birthDate))) {
      errors.birthDate = 'La fecha de nacimiento no es válida';
    }

    if (data.entryDate && isNaN(Date.parse(data.entryDate))) {
      errors.entryDate = 'La fecha de ingreso no es válida';
    }

    // Validar customMonthlyFee si se proporciona
    if (data.customMonthlyFee !== undefined && data.customMonthlyFee !== null) {
      const fee = Number(data.customMonthlyFee);
      if (isNaN(fee) || fee < 0) {
        errors.customMonthlyFee = 'La mensualidad personalizada debe ser un número válido mayor o igual a 0';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  static async validateUpdate(id, data) {
    const errors = {};
    const studentId = Number(id);

    // Validar unicidad de documento si cambia
    if (data.document && data.document.trim()) {
      const existing = await prisma.student.findFirst({
        where: {
          document: data.document.trim(),
          NOT: { id: studentId }
        }
      });
      if (existing) {
        errors.document = 'Ya existe otro alumno registrado con este número de documento';
      }
    }

    // Validar categoría si cambia
    if (data.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: Number(data.categoryId) }
      });
      if (!category) {
        errors.categoryId = 'La categoría seleccionada no existe';
      }
    }

    // Validar Enums
    const validGenders = ['MASCULINO', 'FEMENINO', 'OTRO'];
    if (data.gender && !validGenders.includes(data.gender)) {
      errors.gender = `El sexo debe ser uno de los siguientes valores: ${validGenders.join(', ')}`;
    }

    const validDominantFeet = ['DERECHO', 'IZQUIERDO', 'AMBIDIESTRO'];
    if (data.dominantFoot && !validDominantFeet.includes(data.dominantFoot)) {
      errors.dominantFoot = `El pie dominante debe ser uno de los siguientes valores: ${validDominantFeet.join(', ')}`;
    }

    const validPositions = ['PORTERO', 'DEFENSA', 'MEDIOCAMPISTA', 'DELANTERO'];
    if (data.position && !validPositions.includes(data.position)) {
      errors.position = `La posición debe ser una de las siguientes: ${validPositions.join(', ')}`;
    }

    const validStatuses = ['ACTIVE', 'INACTIVE'];
    if (data.status && !validStatuses.includes(data.status)) {
      errors.status = `El estado debe ser ACTIVE o INACTIVE`;
    }

    // Validar fechas
    if (data.birthDate && isNaN(Date.parse(data.birthDate))) {
      errors.birthDate = 'La fecha de nacimiento no es válida';
    }

    if (data.entryDate && isNaN(Date.parse(data.entryDate))) {
      errors.entryDate = 'La fecha de ingreso no es válida';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}
