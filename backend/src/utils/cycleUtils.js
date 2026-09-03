/**
 * Utilidades de cálculo de ciclos de mensualidad para AcademiaPro.
 * Normalizado a mediodía UTC (T12:00:00.000Z) para evitar desfases de huso horario (UTC-5 Colombia).
 */

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

/**
 * Normaliza cualquier fecha (Date o string YYYY-MM-DD o ISO) a mediodía UTC
 * Respetando la fecha local (UTC-5 Colombia) para la fecha actual de ejecución.
 */
export function parseUtcDate(dateVal) {
  if (!dateVal) {
    const d = new Date();
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0));
  }
  if (typeof dateVal === 'string') {
    const cleanStr = dateVal.split('T')[0];
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) {
      return new Date(`${cleanStr}T12:00:00.000Z`);
    }
  }
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) {
    throw new Error('La fecha proporcionada no es válida');
  }

  // Si la fecha proviene de la base de datos a medianoche UTC, usar UTC.
  // De lo contrario, usar componentes locales para la fecha del sistema.
  const isUtcMidnight = d.getUTCHours() === 0 && d.getUTCMinutes() === 0 && d.getUTCSeconds() === 0;
  if (isUtcMidnight) {
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 12, 0, 0, 0));
  } else {
    return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate(), 12, 0, 0, 0));
  }
}

/**
 * Formatea una fecha a string YYYY-MM-DD
 */
export function formatIsoDate(dateVal) {
  const d = parseUtcDate(dateVal);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Retorna la cantidad de días de un mes específico (1-indexed month)
 */
export function getDaysInMonth(year, month1Indexed) {
  return new Date(Date.UTC(year, month1Indexed, 0)).getUTCDate();
}

/**
 * Calcula la fecha de fin de ciclo (cycleEndDate) basada en la fecha de inicio (cycleStartDate).
 * Regla: 1 mes de cobertura exacto.
 * - Si el día de inicio excede la cantidad de días del mes siguiente (ej. 31 de Agosto),
 *   el ciclo finaliza el último día de ese mes (ej. 30 de Septiembre).
 * - En caso normal (ej. 15 de Mayo), finaliza un día antes del aniversario del mes siguiente (ej. 14 de Junio).
 */
export function calculateCycleEndDate(startDateVal) {
  const start = parseUtcDate(startDateVal);
  const startY = start.getUTCFullYear();
  const startM = start.getUTCMonth(); // 0-11
  const startD = start.getUTCDate();  // 1-31

  let nextM = startM + 1;
  let nextY = startY;
  if (nextM > 11) {
    nextM = 0;
    nextY = startY + 1;
  }

  const maxDaysNextM = getDaysInMonth(nextY, nextM + 1);

  let endYear = nextY;
  let endMonth = nextM;
  let endDay;

  if (startD > maxDaysNextM) {
    // Caso de desborde (ej. 31/08 -> 30/09)
    endDay = maxDaysNextM;
  } else {
    // Caso normal (ej. 15/05 -> 14/06)
    // Aniversario es (nextY, nextM, startD). Restamos 1 día:
    const targetAnniversary = new Date(Date.UTC(nextY, nextM, startD, 12, 0, 0, 0));
    targetAnniversary.setUTCDate(targetAnniversary.getUTCDate() - 1);
    endYear = targetAnniversary.getUTCFullYear();
    endMonth = targetAnniversary.getUTCMonth();
    endDay = targetAnniversary.getUTCDate();
  }

  return new Date(Date.UTC(endYear, endMonth, endDay, 12, 0, 0, 0));
}

/**
 * Infiere la fecha de inicio y fin de ciclo para pagos históricos que no tengan cycleStartDate/cycleEndDate.
 */
export function inferHistoricalCycle(payment, studentEntryDate) {
  if (payment.cycleStartDate && payment.cycleEndDate) {
    return {
      cycleStartDate: parseUtcDate(payment.cycleStartDate),
      cycleEndDate: parseUtcDate(payment.cycleEndDate)
    };
  }

  // Si no tiene campos de ciclo, reconstruimos basados en month, year y entryDate
  const month = payment.month;
  const year = payment.year;
  const entryDate = studentEntryDate ? parseUtcDate(studentEntryDate) : parseUtcDate(payment.paymentDate);
  const entryDay = entryDate.getUTCDate();

  const maxDaysInMonth = getDaysInMonth(year, month);
  const startDay = Math.min(entryDay, maxDaysInMonth);

  const cycleStartDate = new Date(Date.UTC(year, month - 1, startDay, 12, 0, 0, 0));
  const cycleEndDate = calculateCycleEndDate(cycleStartDate);

  return {
    cycleStartDate,
    cycleEndDate
  };
}

/**
 * Obtiene la recomendación de ciclo para un alumno dado un nuevo pago.
 * Detecta si existe interrupción entre la fecha de fin del último ciclo cubierto y la nueva fecha de pago.
 */
export function getRecommendedCycle(student, existingMonthlyPayments = [], targetPaymentDateVal = null) {
  const targetPaymentDate = targetPaymentDateVal ? parseUtcDate(targetPaymentDateVal) : parseUtcDate(new Date());
  const entryDate = student.entryDate ? parseUtcDate(student.entryDate) : targetPaymentDate;

  // Filtrar y ordenar los pagos de mensualidad vigentes con su ciclo inferido
  const processedPayments = existingMonthlyPayments.map(p => {
    const { cycleStartDate, cycleEndDate } = inferHistoricalCycle(p, student.entryDate);
    return {
      ...p,
      cycleStartDate,
      cycleEndDate
    };
  }).sort((a, b) => b.cycleEndDate.getTime() - a.cycleEndDate.getTime());

  if (processedPayments.length === 0) {
    // Alumno nuevo (sin pagos previos): El primer ciclo inicia en entryDate
    const cycleStartDate = entryDate;
    const cycleEndDate = calculateCycleEndDate(cycleStartDate);
    return {
      isFirstCycle: true,
      hasInterruption: false,
      recommendedStartDate: cycleStartDate,
      recommendedEndDate: cycleEndDate,
      interruptionFrom: null,
      interruptionTo: null,
      month: cycleStartDate.getUTCMonth() + 1,
      year: cycleStartDate.getUTCFullYear()
    };
  }

  // Alumno con pagos previos: obtener el último ciclo cubierto
  const lastPayment = processedPayments[0];
  const lastCycleEnd = lastPayment.cycleEndDate;

  // Fecha en la que debería continuar consecutivamente el siguiente ciclo:
  let expectedNextStart;
  const lastStartD = lastPayment.cycleStartDate ? lastPayment.cycleStartDate.getUTCDate() : 1;
  const lastEndD = lastCycleEnd.getUTCDate();
  const lastEndMonthMaxDays = getDaysInMonth(lastCycleEnd.getUTCFullYear(), lastCycleEnd.getUTCMonth() + 1);

  if (lastStartD > lastEndMonthMaxDays && lastEndD === lastEndMonthMaxDays) {
    expectedNextStart = new Date(Date.UTC(lastCycleEnd.getUTCFullYear(), lastCycleEnd.getUTCMonth(), lastEndD, 12, 0, 0, 0));
  } else {
    expectedNextStart = new Date(Date.UTC(lastCycleEnd.getUTCFullYear(), lastCycleEnd.getUTCMonth(), lastEndD + 1, 12, 0, 0, 0));
  }

  // Comparar fecha de pago con fecha esperada continua
  const daysDiff = Math.floor((targetPaymentDate.getTime() - expectedNextStart.getTime()) / (1000 * 60 * 60 * 24));

  if (daysDiff > 1) {
    // Hubo INTERRUPCIÓN
    const interruptionFrom = new Date(expectedNextStart.getTime());
    const interruptionTo = new Date(Date.UTC(targetPaymentDate.getUTCFullYear(), targetPaymentDate.getUTCMonth(), targetPaymentDate.getUTCDate() - 1, 12, 0, 0, 0));

    const cycleStartDate = targetPaymentDate;
    const cycleEndDate = calculateCycleEndDate(cycleStartDate);

    return {
      isFirstCycle: false,
      hasInterruption: true,
      interruptionFrom,
      interruptionTo,
      recommendedStartDate: cycleStartDate,
      recommendedEndDate: cycleEndDate,
      month: cycleStartDate.getUTCMonth() + 1,
      year: cycleStartDate.getUTCFullYear()
    };
  } else {
    // Ciclo CONSECUTIVO normal
    const cycleStartDate = expectedNextStart;
    const cycleEndDate = calculateCycleEndDate(cycleStartDate);

    return {
      isFirstCycle: false,
      hasInterruption: false,
      interruptionFrom: null,
      interruptionTo: null,
      recommendedStartDate: cycleStartDate,
      recommendedEndDate: cycleEndDate,
      month: cycleStartDate.getUTCMonth() + 1,
      year: cycleStartDate.getUTCFullYear()
    };
  }
}

/**
 * Formatea un rango de fechas a etiqueta corta en español (ej. "31 ago → 30 sep")
 */
export function formatPeriodLabel(startDateVal, endDateVal) {
  if (!startDateVal || !endDateVal) return '';
  const start = parseUtcDate(startDateVal);
  const end = parseUtcDate(endDateVal);

  const startDay = start.getUTCDate();
  const startMonthName = MONTH_NAMES[start.getUTCMonth()].slice(0, 3).toLowerCase();

  const endDay = end.getUTCDate();
  const endMonthName = MONTH_NAMES[end.getUTCMonth()].slice(0, 3).toLowerCase();

  return `${startDay} ${startMonthName} → ${endDay} ${endMonthName}`;
}
