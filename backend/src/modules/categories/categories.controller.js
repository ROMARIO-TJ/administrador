import { CategoriesService } from './categories.service.js';
import { successResponse, errorResponse } from '../../utils/response.js';

export class CategoriesController {
  static async getAll(req, res, next) {
    try {
      const categories = await CategoriesService.getAllCategories();
      return successResponse(res, categories, 'Categorías obtenidas correctamente');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async getById(req, res, next) {
    try {
      const category = await CategoriesService.getCategoryById(req.params.id);
      return successResponse(res, category, 'Categoría obtenida correctamente');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async create(req, res, next) {
    try {
      const category = await CategoriesService.createCategory(req.body);
      return successResponse(res, category, 'Categoría creada con éxito', 201);
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async update(req, res, next) {
    try {
      const category = await CategoriesService.updateCategory(req.params.id, req.body);
      return successResponse(res, category, 'Categoría actualizada con éxito');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  static async delete(req, res, next) {
    try {
      await CategoriesService.deleteCategory(req.params.id);
      return successResponse(res, null, 'Categoría eliminada con éxito');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}
