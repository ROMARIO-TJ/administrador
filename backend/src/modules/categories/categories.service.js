import prisma from '../../config/db.js';

export class CategoriesService {
  /**
   * Obtener todas las categorías de alumnos
   */
  static async getAllCategories() {
    return await prisma.category.findMany({
      orderBy: { id: 'asc' },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });
  }

  /**
   * Obtener una categoría por ID
   */
  static async getCategoryById(id) {
    const category = await prisma.category.findUnique({
      where: { id: Number(id) },
      include: {
        _count: {
          select: { students: true }
        }
      }
    });

    if (!category) {
      const error = new Error('Categoría no encontrada');
      error.statusCode = 404;
      throw error;
    }

    return category;
  }

  /**
   * Crear nueva categoría
   */
  static async createCategory(data) {
    const { name, description } = data;

    if (!name || !name.trim()) {
      const error = new Error('El nombre de la categoría es obligatorio');
      error.statusCode = 400;
      throw error;
    }

    const existing = await prisma.category.findUnique({
      where: { name: name.trim() }
    });

    if (existing) {
      const error = new Error('Ya existe una categoría con este nombre');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.category.create({
      data: {
        name: name.trim(),
        description: description ? description.trim() : null
      }
    });
  }

  /**
   * Actualizar categoría
   */
  static async updateCategory(id, data) {
    const categoryId = Number(id);
    await this.getCategoryById(categoryId);

    const { name, description } = data;

    if (name && name.trim()) {
      const existing = await prisma.category.findFirst({
        where: {
          name: name.trim(),
          NOT: { id: categoryId }
        }
      });

      if (existing) {
        const error = new Error('Ya existe otra categoría con este nombre');
        error.statusCode = 400;
        throw error;
      }
    }

    return await prisma.category.update({
      where: { id: categoryId },
      data: {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description: description ? description.trim() : null })
      }
    });
  }

  /**
   * Eliminar categoría (si no tiene alumnos asignados)
   */
  static async deleteCategory(id) {
    const categoryId = Number(id);
    const category = await this.getCategoryById(categoryId);

    if (category._count && category._count.students > 0) {
      const error = new Error('No se puede eliminar la categoría porque tiene alumnos asignados');
      error.statusCode = 400;
      throw error;
    }

    return await prisma.category.delete({
      where: { id: categoryId }
    });
  }
}
