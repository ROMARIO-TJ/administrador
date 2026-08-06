import prisma from '../../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../../config/jwt.js';

/**
 * Servicio con la lógica de negocio del módulo de autenticación
 */
export class AuthService {
  /**
   * Autentica un usuario con su correo y contraseña
   */
  static async login(email, password) {
    if (!email || !password) {
      throw { statusCode: 400, message: 'El correo y la contraseña son obligatorios' };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
      throw { statusCode: 401, message: 'Credenciales inválidas' };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw { statusCode: 401, message: 'Credenciales inválidas' };
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  /**
   * Obtiene la información del usuario autenticado actual
   */
  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      throw { statusCode: 404, message: 'Usuario no encontrado' };
    }

    return user;
  }
}
