import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.log('Error details:', err);

  let status = err.status || err.statusCode || 500;

  if (err.message === 'Invalid input data' || err.name === 'Validation') {
    status = 400;
  }

  return res.status(status).json({
    name: err.name || 'Error',
    message: err.message || 'Internal Server Error',
    validationErrors: err.validationErrors || err.errors || null,
  });
};
