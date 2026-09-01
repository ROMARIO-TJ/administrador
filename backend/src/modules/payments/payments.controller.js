import { PaymentsService } from './payments.service.js';

export class PaymentsController {
  /**
   * Obtener las tarifas dinámicas vigentes (AcademySetting)
   */
  static async getDefaultFees(req, res, next) {
    try {
      const fees = await PaymentsService.getDefaultFees();
      return res.json({
        success: true,
        data: fees
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Registrar pago de inscripción
   */
  static async registerRegistration(req, res, next) {
    try {
      const userName = req.user?.name || 'Administrador';
      const registration = await PaymentsService.registerRegistration(req.body, userName);
      return res.status(201).json({
        success: true,
        message: 'Pago de inscripción registrado exitosamente',
        data: registration
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Registrar pago de mensualidad
   */
  static async registerMonthlyPayment(req, res, next) {
    try {
      const userName = req.user?.name || 'Administrador';
      const monthlyPayment = await PaymentsService.registerMonthlyPayment(req.body, userName);
      return res.status(201).json({
        success: true,
        message: 'Pago de mensualidad registrado exitosamente',
        data: monthlyPayment
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener estado financiero de un alumno
   */
  static async getStudentFinancialStatus(req, res, next) {
    try {
      const { studentId } = req.params;
      const { year } = req.query;
      const status = await PaymentsService.getStudentFinancialStatus(studentId, year);
      return res.json({
        success: true,
        data: status
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Obtener recomendación de ciclo para un nuevo pago
   */
  static async getRecommendedPaymentCycle(req, res, next) {
    try {
      const { studentId } = req.params;
      const { targetDate } = req.query;
      const recommendation = await PaymentsService.getRecommendedPaymentCycle(studentId, targetDate);
      return res.json({
        success: true,
        data: recommendation
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar pago de inscripción
   */
  static async updateRegistration(req, res, next) {
    try {
      const { id } = req.params;
      const userName = req.user?.name || 'Administrador';
      const registration = await PaymentsService.updateRegistration(id, req.body, userName);
      return res.json({
        success: true,
        message: 'Pago de inscripción actualizado exitosamente',
        data: registration
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Actualizar pago de mensualidad
   */
  static async updateMonthlyPayment(req, res, next) {
    try {
      const { id } = req.params;
      const userName = req.user?.name || 'Administrador';
      const monthlyPayment = await PaymentsService.updateMonthlyPayment(id, req.body, userName);
      return res.json({
        success: true,
        message: 'Pago de mensualidad actualizado exitosamente',
        data: monthlyPayment
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar un pago de inscripción
   */
  static async deleteRegistration(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PaymentsService.deleteRegistration(id);
      return res.json({
        success: true,
        message: 'Pago de inscripción eliminado exitosamente',
        data: result
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Eliminar un pago de mensualidad
   */
  static async deleteMonthlyPayment(req, res, next) {
    try {
      const { id } = req.params;
      const result = await PaymentsService.deleteMonthlyPayment(id);
      return res.json({
        success: true,
        message: 'Pago de mensualidad eliminado exitosamente',
        data: result
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Listar todos los pagos con filtros
   */
  static async getAllPayments(req, res, next) {
    try {
      const result = await PaymentsService.getAllPayments(req.query);
      return res.json({
        success: true,
        data: result.payments,
        summary: result.summary
      });
    } catch (error) {
      next(error);
    }
  }
}
