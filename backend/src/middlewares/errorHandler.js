import { errorResponse } from '../utils/response.js';

/**
 * Middleware centralizado de gestión de errores no capturados
 */
export const errorHandler = (err, req, res, next) => {
  console.error(' Error capturado en Middleware Global:', err);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Error interno del servidor';

  return errorResponse(res, message, statusCode);
};
