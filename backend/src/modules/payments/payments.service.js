import prisma from '../../config/db.js';
import { getNextConsecutive } from '../../utils/consecutive.js';
import {
  parseUtcDate,
  formatIsoDate,
  calculateCycleEndDate,
  inferHistoricalCycle,
  getRecommendedCycle,
  formatPeriodLabel
} from '../../utils/cycleUtils.js';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Normaliza la fecha de pago a mediodía UTC (T12:00:00.000Z) si es un string YYYY-MM-DD
 * para evitar cualquier desfase por huso horario (UTC-5 Colombia).
 */
function parsePaymentDate(dateVal) {
  if (!dateVal) return new Date();
  if (typeof dateVal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
    return new Date(`${dateVal}T12:00:00.000Z`);
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    throw new Error('La fecha de pago no es válida');
  }
  return d;
}

/**
 * Extrae el ID numérico eliminando prefijos opcionales (ej. REG-15 o MEN-28 -> 15 o 28)
 */
function parseId(id) {
  if (id === undefined || id === null) return NaN;
  if (typeof id === 'string') {
    const cleaned = id.replace(/^(REG|MEN)-/i, '');
    return parseInt(cleaned, 10);
  }
  return parseInt(id, 10);
}

export class PaymentsService {
  /**
   * Obtener las tarifas configuradas desde la base de datos (AcademySetting)
   * Si no existen aún, utiliza 50.000 COP como valor inicial predeterminado.
   */
  static async getDefaultFees() {
    const settings = await prisma.academySetting.findFirst();
    return {
      registrationFee: settings?.registrationFee ?? 50000.0,
      monthlyFee: settings?.monthlyFee ?? 50000.0
    };
  }

  /**
   * Registrar pago de inscripción para un alumno.
   * Un alumno solo puede tener UNA inscripción.
   */
  static async registerRegistration(data, userName = 'Administrador') {
    const studentId = parseInt(data.studentId);
    if (!studentId || isNaN(studentId)) {
      throw new Error('ID de alumno no válido');
    }

    // Verificar existencia del alumno
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new Error('El alumno especificado no existe');
    }

    // Verificar si el alumno ya cuenta con pago de inscripción
    const existingRegistration = await prisma.registration.findUnique({
      where: { studentId }
    });

    if (existingRegistration) {
      throw new Error(`El alumno ${student.firstName} ${student.lastName} ya tiene un pago de inscripción registrado (${existingRegistration.consecutive}).`);
    }

    // Obtener valor dinámico por defecto si no se proporciona uno específico
    const defaultFees = await this.getDefaultFees();
    const finalAmount = data.amount !== undefined && data.amount !== null && data.amount !== ''
      ? parseFloat(data.amount)
      : defaultFees.registrationFee;

    // Generar consecutivo automático INS-000001
    const consecutive = await getNextConsecutive(prisma, 'REGISTRATION', 'INS-');

    const newRegistration = await prisma.registration.create({
      data: {
        consecutive,
        studentId,
        amount: finalAmount,
        paymentDate: parsePaymentDate(data.paymentDate),
        paymentMethod: data.paymentMethod || 'EFECTIVO',
        notes: data.notes || null,
        registeredBy: userName
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            document: true,
            category: { select: { name: true } }
          }
        }
      }
    });

    return newRegistration;
  }

  /**
   * Actualizar un pago de inscripción existente.
   * Modifica fecha, valor, método y observaciones manteniendo intacto el consecutivo e inmutable el alumno.
   */
  static async updateRegistration(id, data, userName = 'Administrador') {
    const regId = parseId(id);
    if (!regId || isNaN(regId)) {
      throw new Error('ID de inscripción no válido');
    }

    const existingRegistration = await prisma.registration.findUnique({
      where: { id: regId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            document: true,
            category: { select: { name: true } }
          }
        }
      }
    });

    if (!existingRegistration) {
      throw new Error('El registro de inscripción especificado no existe');
    }

    // Validar monto si se especifica
    let finalAmount = existingRegistration.amount;
    if (data.amount !== undefined && data.amount !== null && data.amount !== '') {
      const parsedAmount = parseFloat(data.amount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        throw new Error('El valor del pago debe ser un número positivo mayor a 0');
      }
      finalAmount = parsedAmount;
    }

    // Validar fecha de pago si se especifica
    let finalPaymentDate = existingRegistration.paymentDate;
    if (data.paymentDate) {
      finalPaymentDate = parsePaymentDate(data.paymentDate);
    }

    // Método de pago
    const finalPaymentMethod = data.paymentMethod ? String(data.paymentMethod).toUpperCase() : existingRegistration.paymentMethod;

    // Observaciones
    const finalNotes = data.notes !== undefined ? (data.notes || null) : existingRegistration.notes;

    // Actualizar en base de datos (consecutive, studentId, id permanecen inmutables)
    const updatedRegistration = await prisma.registration.update({
      where: { id: regId },
      data: {
        amount: finalAmount,
        paymentDate: finalPaymentDate,
        paymentMethod: finalPaymentMethod,
        notes: finalNotes
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            document: true,
            category: { select: { name: true } }
          }
        }
      }
    });

    return updatedRegistration;
  }

  /**
  /**
   * Registrar pago de mensualidad para un alumno.
   * Manejado por Ciclos de Cobertura dinámicos.
   */
  static async registerMonthlyPayment(data, userName = 'Administrador') {
    const studentId = parseInt(data.studentId);

    if (!studentId || isNaN(studentId)) {
      throw new Error('ID de alumno no válido');
    }

    // Verificar existencia del alumno con sus pagos previos de mensualidad
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        monthlyPayments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!student) {
      throw new Error('El alumno especificado no existe');
    }

    const paymentDate = data.paymentDate ? parseUtcDate(data.paymentDate) : parseUtcDate(new Date());

    // Determinar fechas de inicio y fin de ciclo
    let cycleStartDate;
    let cycleEndDate;

    if (data.cycleStartDate) {
      cycleStartDate = parseUtcDate(data.cycleStartDate);
      cycleEndDate = data.cycleEndDate ? parseUtcDate(data.cycleEndDate) : calculateCycleEndDate(cycleStartDate);
    } else {
      const rec = getRecommendedCycle(student, student.monthlyPayments, paymentDate);
      cycleStartDate = rec.recommendedStartDate;
      cycleEndDate = rec.recommendedEndDate;
    }

    const month = data.month ? parseInt(data.month) : (cycleStartDate.getUTCMonth() + 1);
    const year = data.year ? parseInt(data.year) : cycleStartDate.getUTCFullYear();

    if (!month || month < 1 || month > 12) {
      throw new Error('El mes debe ser un valor numérico entre 1 y 12');
    }
    if (!year || year < 2000 || year > 2100) {
      throw new Error('Año no válido');
    }

    // Obtener tarifa sugerida: si el alumno tiene tarifa personalizada usarla, sino leer de AcademySetting
    const defaultFees = await this.getDefaultFees();
    const suggestedFee = student.customMonthlyFee !== null && student.customMonthlyFee !== undefined
      ? student.customMonthlyFee
      : defaultFees.monthlyFee;

    const finalAmount = data.amount !== undefined && data.amount !== null && data.amount !== ''
      ? parseFloat(data.amount)
      : suggestedFee;

    // Generar consecutivo automático MEN-000001
    const consecutive = await getNextConsecutive(prisma, 'MONTHLY_PAYMENT', 'MEN-');

    const newMonthlyPayment = await prisma.monthlyPayment.create({
      data: {
        consecutive,
        studentId,
        month,
        year,
        cycleStartDate,
        cycleEndDate,
        amount: finalAmount,
        paymentDate,
        paymentMethod: data.paymentMethod || 'EFECTIVO',
        notes: data.notes || null,
        registeredBy: userName
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            document: true,
            category: { select: { name: true } }
          }
        }
      }
    });

    return newMonthlyPayment;
  }

  /**
   * Obtener recomendación de ciclo para un nuevo pago
   */
  static async getRecommendedPaymentCycle(studentId, targetDate = null) {
    const id = parseInt(studentId);
    if (!id || isNaN(id)) {
      throw new Error('ID de alumno no válido');
    }

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        monthlyPayments: {
          orderBy: { paymentDate: 'desc' }
        }
      }
    });

    if (!student) {
      throw new Error('El alumno especificado no existe');
    }

    return getRecommendedCycle(student, student.monthlyPayments, targetDate);
  }

  /**
   * Actualizar un pago de mensualidad existente.
   * Modifica fecha, valor, método, mes, año, ciclo y observaciones manteniendo intacto el consecutivo e inmutable el alumno.
   */
  static async updateMonthlyPayment(id, data, userName = 'Administrador') {
    const paymentId = parseId(id);
    if (!paymentId || isNaN(paymentId)) {
      throw new Error('ID de mensualidad no válido');
    }

    const existingMonthlyPayment = await prisma.monthlyPayment.findUnique({
      where: { id: paymentId },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            document: true,
            entryDate: true,
            category: { select: { name: true } }
          }
        }
      }
    });

    if (!existingMonthlyPayment) {
      throw new Error('El registro de mensualidad especificado no existe');
    }

    let finalPaymentDate = existingMonthlyPayment.paymentDate;
    if (data.paymentDate) {
      finalPaymentDate = parseUtcDate(data.paymentDate);
    }

    let cycleStartDate = existingMonthlyPayment.cycleStartDate;
    let cycleEndDate = existingMonthlyPayment.cycleEndDate;

    if (data.cycleStartDate) {
      cycleStartDate = parseUtcDate(data.cycleStartDate);
      cycleEndDate = data.cycleEndDate ? parseUtcDate(data.cycleEndDate) : calculateCycleEndDate(cycleStartDate);
    } else if (!cycleStartDate || data.paymentDate || data.month || data.year) {
      const targetMonth = data.month ? parseInt(data.month) : existingMonthlyPayment.month;
      const targetYear = data.year ? parseInt(data.year) : existingMonthlyPayment.year;
      const entryDate = existingMonthlyPayment.student.entryDate ? parseUtcDate(existingMonthlyPayment.student.entryDate) : finalPaymentDate;
      const entryDay = entryDate.getUTCDate();
      cycleStartDate = new Date(Date.UTC(targetYear, targetMonth - 1, entryDay, 12, 0, 0, 0));
      cycleEndDate = calculateCycleEndDate(cycleStartDate);
    }

    let finalMonth = data.month ? parseInt(data.month) : (cycleStartDate ? cycleStartDate.getUTCMonth() + 1 : existingMonthlyPayment.month);
    let finalYear = data.year ? parseInt(data.year) : (cycleStartDate ? cycleStartDate.getUTCFullYear() : existingMonthlyPayment.year);

    // Validar monto
    let finalAmount = existingMonthlyPayment.amount;
    if (data.amount !== undefined && data.amount !== null && data.amount !== '') {
      const parsedAmount = parseFloat(data.amount);
      if (isNaN(parsedAmount) || parsedAmount < 0) {
        throw new Error('El valor del pago debe ser un número positivo mayor o igual a 0');
      }
      finalAmount = parsedAmount;
    }

    // Método de pago
    const finalPaymentMethod = data.paymentMethod ? String(data.paymentMethod).toUpperCase() : existingMonthlyPayment.paymentMethod;

    // Observaciones
    const finalNotes = data.notes !== undefined ? (data.notes || null) : existingMonthlyPayment.notes;

    // Actualizar en base de datos (consecutive, studentId, id permanecen inmutables)
    const updatedMonthlyPayment = await prisma.monthlyPayment.update({
      where: { id: paymentId },
      data: {
        month: finalMonth,
        year: finalYear,
        cycleStartDate,
        cycleEndDate,
        amount: finalAmount,
        paymentDate: finalPaymentDate,
        paymentMethod: finalPaymentMethod,
        notes: finalNotes
      },
      include: {
        student: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            document: true,
            category: { select: { name: true } }
          }
        }
      }
    });

    return updatedMonthlyPayment;
  }

  /**
   * Eliminar físicamente un pago de inscripción.
   */
  static async deleteRegistration(id) {
    const regId = parseId(id);
    if (!regId || isNaN(regId)) {
      throw new Error('ID de inscripción no válido');
    }

    const existingRegistration = await prisma.registration.findUnique({
      where: { id: regId }
    });

    if (!existingRegistration) {
      throw new Error('El registro de inscripción especificado no existe');
    }

    await prisma.registration.delete({
      where: { id: regId }
    });

    return { id: regId, deleted: true };
  }

  /**
   * Eliminar físicamente un pago de mensualidad.
   */
  static async deleteMonthlyPayment(id) {
    const paymentId = parseId(id);
    if (!paymentId || isNaN(paymentId)) {
      throw new Error('ID de mensualidad no válido');
    }

    const existingMonthlyPayment = await prisma.monthlyPayment.findUnique({
      where: { id: paymentId }
    });

    if (!existingMonthlyPayment) {
      throw new Error('El registro de mensualidad especificado no existe');
    }

    await prisma.monthlyPayment.delete({
      where: { id: paymentId }
    });

    return { id: paymentId, deleted: true };
  }

  /**
   * Obtener estado financiero completo de un alumno para el perfil
   */
  static async getStudentFinancialStatus(studentId, reqYear = null) {
    const id = parseInt(studentId);
    const targetYear = reqYear ? parseInt(reqYear) : new Date().getFullYear();

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        registration: true,
        monthlyPayments: true,
        category: { select: { name: true } }
      }
    });

    if (!student) {
      throw new Error('Alumno no encontrado');
    }

    const defaultFees = await this.getDefaultFees();
    const effectiveMonthlyFee = student.customMonthlyFee ?? defaultFees.monthlyFee;

    // Estado de inscripción
    const registrationStatus = {
      isPaid: !!student.registration,
      fee: defaultFees.registrationFee,
      details: student.registration || null
    };

    // Procesar todos los pagos con su ciclo inferido o guardado
    const processedPayments = student.monthlyPayments.map(p => {
      const { cycleStartDate, cycleEndDate } = inferHistoricalCycle(p, student.entryDate);
      const periodLabel = formatPeriodLabel(cycleStartDate, cycleEndDate);
      return {
        ...p,
        cycleStartDate,
        cycleEndDate,
        periodLabel
      };
    });

    // Mapear por mes del targetYear
    const monthlyPaymentsMap = new Map();
    processedPayments.forEach(p => {
      const year = p.cycleStartDate ? p.cycleStartDate.getUTCFullYear() : p.year;
      const month = p.cycleStartDate ? (p.cycleStartDate.getUTCMonth() + 1) : p.month;
      if (year === targetYear) {
        monthlyPaymentsMap.set(month, p);
      }
    });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12
    const today = parseUtcDate(new Date());

    const yearMonthlyGrid = Array.from({ length: 12 }, (_, index) => {
      const monthNum = index + 1;
      const payment = monthlyPaymentsMap.get(monthNum) || null;
      const isPaid = !!payment;
      
      const entryDate = student.entryDate ? parseUtcDate(student.entryDate) : null;

      let cycleStartDate = payment ? payment.cycleStartDate : null;
      let cycleEndDate = payment ? payment.cycleEndDate : null;
      let periodLabel = payment ? payment.periodLabel : '';

      if (!payment) {
        const entryDay = entryDate ? entryDate.getUTCDate() : 1;
        const gridStartDate = new Date(Date.UTC(targetYear, monthNum - 1, entryDay, 12, 0, 0, 0));
        cycleStartDate = gridStartDate;
        cycleEndDate = calculateCycleEndDate(gridStartDate);
        periodLabel = formatPeriodLabel(cycleStartDate, cycleEndDate);
      }
      
      // Determinar si el mes está vencido/pendiente
      let status = 'FUTURE';
      if (isPaid) {
        status = 'PAID';
      } else {
        if (entryDate && (targetYear < entryDate.getUTCFullYear() || (targetYear === entryDate.getUTCFullYear() && monthNum < entryDate.getUTCMonth() + 1))) {
          status = 'NOT_APPLICABLE';
        } else if (targetYear < currentYear || (targetYear === currentYear && monthNum < currentMonth)) {
          status = 'PENDING';
        } else if (targetYear === currentYear && monthNum === currentMonth) {
          if (today.getTime() >= cycleStartDate.getTime()) {
            status = 'PENDING';
          } else {
            status = 'FUTURE';
          }
        }
      }

      return {
        month: monthNum,
        monthName: MONTH_NAMES[index],
        year: targetYear,
        cycleStartDate,
        cycleEndDate,
        periodLabel,
        isPaid,
        status,
        payment
      };
    });

    // Historial completo de pagos (Inscripción + Mensualidades)
    const history = [];

    if (student.registration) {
      history.push({
        id: `REG-${student.registration.id}`,
        type: 'INSCRIPCION',
        concept: 'Pago de Inscripción',
        consecutive: student.registration.consecutive,
        amount: student.registration.amount,
        paymentDate: student.registration.paymentDate,
        paymentMethod: student.registration.paymentMethod,
        notes: student.registration.notes,
        registeredBy: student.registration.registeredBy
      });
    }

    processedPayments.forEach(p => {
      history.push({
        id: `MEN-${p.id}`,
        type: 'MENSUALIDAD',
        concept: `Mensualidad ${MONTH_NAMES[p.month - 1]} ${p.year}`,
        consecutive: p.consecutive,
        amount: p.amount,
        month: p.month,
        year: p.year,
        cycleStartDate: p.cycleStartDate,
        cycleEndDate: p.cycleEndDate,
        periodLabel: p.periodLabel,
        paymentDate: p.paymentDate,
        paymentMethod: p.paymentMethod,
        notes: p.notes,
        registeredBy: p.registeredBy
      });
    });

    // Ordenar historial por fecha de pago descendente
    history.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    // Cálculos de Totales
    const totalPaidInscripciones = student.registration ? student.registration.amount : 0;
    const totalPaidMensualidades = student.monthlyPayments.reduce((sum, p) => sum + p.amount, 0);
    const totalPaid = totalPaidInscripciones + totalPaidMensualidades;

    // Cálculo de saldo pendiente basado en la vigencia del último ciclo pagado
    let pendingBalance = 0;
    if (!student.registration) {
      pendingBalance += defaultFees.registrationFee;
    }

    const sortedPayments = [...processedPayments].sort((a, b) => b.cycleEndDate.getTime() - a.cycleEndDate.getTime());
    const lastPaidCycleEnd = sortedPayments.length > 0 ? sortedPayments[0].cycleEndDate : null;

    if (student.status === 'ACTIVE') {
      if (!lastPaidCycleEnd) {
        const entryDate = student.entryDate ? parseUtcDate(student.entryDate) : today;
        if (today.getTime() >= entryDate.getTime()) {
          pendingBalance += effectiveMonthlyFee;
        }
      } else {
        if (today.getTime() > lastPaidCycleEnd.getTime()) {
          pendingBalance += effectiveMonthlyFee;
        }
      }
    }

    return {
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      document: student.document,
      effectiveMonthlyFee,
      isCustomFee: student.customMonthlyFee !== null,
      defaultRegistrationFee: defaultFees.registrationFee,
      defaultMonthlyFee: defaultFees.monthlyFee,
      registrationStatus,
      targetYear,
      yearMonthlyGrid,
      history,
      totalPaid,
      totalPaidInscripciones,
      totalPaidMensualidades,
      pendingBalance,
      lastPaidCycleEnd
    };
  }

  /**
   * Obtener listado de todos los pagos (Inscripciones y Mensualidades) con filtros
   */
  static async getAllPayments(filters = {}) {
    const { type, studentId, search, year } = filters;

    let registrations = [];
    let monthlyPayments = [];

    const studentWhere = {};
    if (studentId) {
      studentWhere.id = parseInt(studentId);
    }
    if (search) {
      studentWhere.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } }
      ];
    }

    // Cargar Inscripciones si no está filtrado por solo mensualidades
    if (!type || type === 'ALL' || type === 'REGISTRATION') {
      const regWhere = {};
      if (studentId || search) {
        regWhere.student = studentWhere;
      }
      if (search) {
        regWhere.OR = [
          { consecutive: { contains: search, mode: 'insensitive' } },
          { student: studentWhere }
        ];
      }

      registrations = await prisma.registration.findMany({
        where: regWhere,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              document: true,
              category: { select: { name: true } }
            }
          }
        },
        orderBy: { paymentDate: 'desc' }
      });
    }

    // Cargar Mensualidades si no está filtrado por solo inscripciones
    if (!type || type === 'ALL' || type === 'MONTHLY') {
      const monthWhere = {};
      if (year) {
        monthWhere.year = parseInt(year);
      }
      if (studentId || search) {
        monthWhere.student = studentWhere;
      }
      if (search) {
        monthWhere.OR = [
          { consecutive: { contains: search, mode: 'insensitive' } },
          { student: studentWhere }
        ];
      }

      monthlyPayments = await prisma.monthlyPayment.findMany({
        where: monthWhere,
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              document: true,
              category: { select: { name: true } }
            }
          }
        },
        orderBy: { paymentDate: 'desc' }
      });
    }

    // Combinar y mapear resultados uniformes
    const formattedRegistrations = registrations.map(r => ({
      id: `REG-${r.id}`,
      rawId: r.id,
      type: 'INSCRIPCION',
      concept: 'Inscripción',
      consecutive: r.consecutive,
      studentId: r.studentId,
      studentName: r.student ? `${r.student.firstName} ${r.student.lastName}` : 'N/A',
      studentDocument: r.student ? r.student.document : 'N/A',
      categoryName: r.student?.category?.name || 'N/A',
      amount: r.amount,
      period: 'Inscripción Única',
      paymentDate: r.paymentDate,
      paymentMethod: r.paymentMethod,
      notes: r.notes,
      registeredBy: r.registeredBy
    }));

    const formattedMonthly = monthlyPayments.map(m => {
      const { cycleStartDate, cycleEndDate } = inferHistoricalCycle(m, m.student?.entryDate);
      const periodLabel = formatPeriodLabel(cycleStartDate, cycleEndDate);
      return {
        id: `MEN-${m.id}`,
        rawId: m.id,
        type: 'MENSUALIDAD',
        concept: `Mensualidad (${MONTH_NAMES[m.month - 1]} ${m.year})`,
        consecutive: m.consecutive,
        studentId: m.studentId,
        studentName: m.student ? `${m.student.firstName} ${m.student.lastName}` : 'N/A',
        studentDocument: m.student ? m.student.document : 'N/A',
        categoryName: m.student?.category?.name || 'N/A',
        amount: m.amount,
        period: periodLabel ? `${MONTH_NAMES[m.month - 1]} ${m.year} (${periodLabel})` : `${MONTH_NAMES[m.month - 1]} ${m.year}`,
        cycleStartDate,
        cycleEndDate,
        periodLabel,
        paymentDate: m.paymentDate,
        paymentMethod: m.paymentMethod,
        notes: m.notes,
        registeredBy: m.registeredBy
      };
    });

    const allPayments = [...formattedRegistrations, ...formattedMonthly];
    allPayments.sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate));

    const totalAmountCollected = allPayments.reduce((acc, p) => acc + p.amount, 0);
    const monthlyAmountCollected = formattedMonthly.reduce((acc, p) => acc + p.amount, 0);
    const registrationAmountCollected = formattedRegistrations.reduce((acc, p) => acc + p.amount, 0);
    const registrationCount = formattedRegistrations.length;
    const monthlyCount = formattedMonthly.length;

    return {
      payments: allPayments,
      summary: {
        totalPayments: allPayments.length,
        totalAmountCollected,
        monthlyAmountCollected,
        registrationAmountCollected,
        registrationCount,
        monthlyCount
      }
    };
  }
}
