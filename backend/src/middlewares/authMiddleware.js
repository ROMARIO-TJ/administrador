import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.js';
import { errorResponse } from '../utils/response.js';

/**
 * Middleware para validar el token JWT en las solicitudes protegidas
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return errorResponse(res, 'Acceso denegado. No se proporcionó un token de autenticación.', 401);
  }

  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch (error) {
    return errorResponse(res, 'Token inválido o expirado.', 401);
  }
};
