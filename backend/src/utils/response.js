/**
 * Formateador estándar de respuestas exitosas de la API
 */
export const successResponse = (res, data = null, message = 'Operación exitosa', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Formateador estándar de respuestas de error de la API
 */
export const errorResponse = (res, message = 'Ocurrió un error en la solicitud', statusCode = 400, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
