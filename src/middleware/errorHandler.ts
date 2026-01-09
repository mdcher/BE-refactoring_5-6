import { Request, Response, NextFunction } from 'express';

import { CustomError } from '../utils/response/custom-error/CustomError';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Якщо це наш CustomError, використовуємо його JSON метод
  if (err instanceof CustomError) {
    return res.status(err.HttpStatusCode).json(err.JSON);
  }

  // Обробка інших помилок
  return res.status(500).json({
    errorType: 'General',
    errorMessage: err.message || 'Internal Server Error',
    errors: null,
    errorRaw: process.env.NODE_ENV === 'dev' ? err : null,
    errorsValidation: null,
    stack: process.env.NODE_ENV === 'dev' ? err.stack : undefined,
  });
};
