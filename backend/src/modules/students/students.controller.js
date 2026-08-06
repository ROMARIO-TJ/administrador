import { StudentsService } from './students.service.js';
import { StudentsValidation } from './students.validation.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class StudentsController {
  /**
   * GET /api/students
   */
  static async getAll(req, res, next) {
    try {
      const filters = {
        search: req.query.search,
        categoryId: req.query.categoryId,
        status: req.query.status
      };
      const students = await StudentsService.getAllStudents(filters);
      return successResponse(res, students, 'Lista de alumnos obtenida correctamente');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/students/:id
   */
  static async getById(req, res, next) {
    try {
      const student = await StudentsService.getStudentById(req.params.id);
      return successResponse(res, student, 'Detalles del alumno obtenidos correctamente');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * POST /api/students
   */
  static async create(req, res, next) {
    try {
      const validation = await StudentsValidation.validateCreate(req.body);
      if (!validation.isValid) {
        return errorResponse(res, 'Error de validación en los datos del alumno', 400, validation.errors);
      }

      const student = await StudentsService.createStudent(req.body);
      return successResponse(res, student, 'Alumno registrado con éxito', 201);
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * PUT /api/students/:id
   */
  static async update(req, res, next) {
    try {
      const validation = await StudentsValidation.validateUpdate(req.params.id, req.body);
      if (!validation.isValid) {
        return errorResponse(res, 'Error de validación al actualizar el alumno', 400, validation.errors);
      }

      const student = await StudentsService.updateStudent(req.params.id, req.body);
      return successResponse(res, student, 'Alumno actualizado con éxito');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * PATCH /api/students/:id/status
   */
  static async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      if (!status || !['ACTIVE', 'INACTIVE'].includes(status)) {
        return errorResponse(res, 'El estado debe ser ACTIVE o INACTIVE', 400);
      }

      const student = await StudentsService.updateStudentStatus(req.params.id, status);
      return successResponse(res, student, `Estado del alumno cambiado a ${status} con éxito`);
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * DELETE /api/students/:id
   * Borrado lógico: Cambia el estado a INACTIVE.
   */
  static async deleteLogical(req, res, next) {
    try {
      const student = await StudentsService.deleteStudentLogical(req.params.id);
      return successResponse(res, student, 'Alumno marcado como INACTIVO con éxito');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * DELETE /api/students/:id/permanent
   * Eliminación Definitiva (Física) de PostgreSQL con control de integridad referencial.
   */
  static async deletePhysical(req, res, next) {
    try {
      const result = await StudentsService.deleteStudentPhysical(req.params.id);
      return successResponse(res, result, 'Alumno eliminado definitivamente del sistema de PostgreSQL con éxito');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}
