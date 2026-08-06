import * as ReportServices from './services/index.js';

export class ReportsController {
  /**
   * GET /api/reports/students
   */
  static async getStudentsReport(req, res, next) {
    try {
      const data = await ReportServices.getStudentsReport(req.query);
      return res.json({ success: true, data: data.students, summary: data.summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/monthly
   */
  static async getMonthlyReport(req, res, next) {
    try {
      const data = await ReportServices.getMonthlyReport(req.query);
      return res.json({ success: true, data: data.matrix, summary: data.summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/debtors
   */
  static async getDebtorsReport(req, res, next) {
    try {
      const data = await ReportServices.getDebtorsReport(req.query);
      return res.json({ success: true, data: data.debtors, summary: data.summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/income
   */
  static async getIncomeReport(req, res, next) {
    try {
      const data = await ReportServices.getIncomeReport(req.query);
      return res.json({ success: true, kpis: data.kpis, filteredPeriod: data.filteredPeriod });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/categories
   */
  static async getCategoriesReport(req, res, next) {
    try {
      const data = await ReportServices.getCategoriesReport();
      return res.json({ success: true, data: data.categories, summary: data.summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/registrations
   */
  static async getRegistrationsReport(req, res, next) {
    try {
      const data = await ReportServices.getRegistrationsReport(req.query);
      return res.json({ success: true, data: data.registrations, summary: data.summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/movements
   */
  static async getMovementsReport(req, res, next) {
    try {
      const data = await ReportServices.getMovementsReport(req.query);
      return res.json({ success: true, data: data.movements, summary: data.summary });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reports/student/:id
   */
  static async getStudentIndividualReport(req, res, next) {
    try {
      const data = await ReportServices.getStudentIndividualReport(req.params.id);
      return res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }
}
