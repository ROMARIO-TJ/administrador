import prisma from '../../config/db.js';
import { getNextConsecutive } from '../../utils/consecutive.js';

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

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
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
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
   * Registrar pago de mensualidad para un alumno.
   * Un alumno no puede pagar dos veces el mismo mes del mismo año.
   */
  static async registerMonthlyPayment(data, userName = 'Administrador') {
    const studentId = parseInt(data.studentId);
    const month = parseInt(data.month);
    const year = parseInt(data.year);

    if (!studentId || isNaN(studentId)) {
      throw new Error('ID de alumno no válido');
    }
    if (!month || month < 1 || month > 12) {
      throw new Error('El mes debe ser un valor numérico entre 1 y 12');
    }
    if (!year || year < 2000 || year > 2100) {
      throw new Error('Año no válido');
    }

    // Verificar existencia del alumno
    const student = await prisma.student.findUnique({
      where: { id: studentId }
    });

    if (!student) {
      throw new Error('El alumno especificado no existe');
    }

    // Verificar duplicado mes + año para el mismo alumno
    const existingMonthlyPayment = await prisma.monthlyPayment.findUnique({
      where: {
        studentId_month_year: {
          studentId,
          month,
          year
        }
      }
    });

    if (existingMonthlyPayment) {
      const monthName = MONTH_NAMES[month - 1];
      throw new Error(`El alumno ${student.firstName} ${student.lastName} ya registró la mensualidad de ${monthName} de ${year} (${existingMonthlyPayment.consecutive}).`);
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
        amount: finalAmount,
        paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
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

    // Mensualidades del año seleccionado
    const monthlyPaymentsMap = new Map();
    student.monthlyPayments.forEach(p => {
      if (p.year === targetYear) {
        monthlyPaymentsMap.set(p.month, p);
      }
    });

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1; // 1-12

    const yearMonthlyGrid = Array.from({ length: 12 }, (_, index) => {
      const monthNum = index + 1;
      const payment = monthlyPaymentsMap.get(monthNum) || null;
      const isPaid = !!payment;
      
      // Determinar si el mes está vencido/pendiente
      let status = 'FUTURE';
      if (isPaid) {
        status = 'PAID';
      } else {
        const entryDate = student.entryDate ? new Date(student.entryDate) : null;
        if (entryDate && (targetYear < entryDate.getFullYear() || (targetYear === entryDate.getFullYear() && monthNum < entryDate.getMonth() + 1))) {
          status = 'NOT_APPLICABLE';
        } else if (targetYear < currentYear || (targetYear === currentYear && monthNum <= currentMonth)) {
          status = 'PENDING';
        }
      }

      return {
        month: monthNum,
        monthName: MONTH_NAMES[index],
        year: targetYear,
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

    student.monthlyPayments.forEach(p => {
      history.push({
        id: `MEN-${p.id}`,
        type: 'MENSUALIDAD',
        concept: `Mensualidad ${MONTH_NAMES[p.month - 1]} ${p.year}`,
        consecutive: p.consecutive,
        amount: p.amount,
        month: p.month,
        year: p.year,
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

    // Cálculo de saldo pendiente
    let pendingBalance = 0;
    if (!student.registration) {
      pendingBalance += defaultFees.registrationFee;
    }

    // Sumar mensualidades no pagadas hasta el mes actual del año en curso
    yearMonthlyGrid.forEach(m => {
      if (m.status === 'PENDING') {
        pendingBalance += effectiveMonthlyFee;
      }
    });

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
      pendingBalance
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

    const formattedMonthly = monthlyPayments.map(m => ({
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
      period: `${MONTH_NAMES[m.month - 1]} ${m.year}`,
      paymentDate: m.paymentDate,
      paymentMethod: m.paymentMethod,
      notes: m.notes,
      registeredBy: m.registeredBy
    }));

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
