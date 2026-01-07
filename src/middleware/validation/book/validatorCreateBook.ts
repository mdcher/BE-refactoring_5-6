import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from '../../../utils/response/custom-error/CustomError';

export const validatorCreateBook = (req: Request, _res: Response, next: NextFunction) => {
  const { title, year, publisher } = req.body;
  const errorsValidation = [];

  if (!title || validator.isEmpty(title)) {
    errorsValidation.push({ title: 'Title is required' });
  }

  if (!publisher || validator.isEmpty(publisher)) {
    errorsValidation.push({ publisher: 'Publisher is required' });
  }

  if (!year || !validator.isInt(String(year), { min: 1900, max: new Date().getFullYear() + 1 })) {
    errorsValidation.push({ year: 'Year must be a valid number (1900+)' });
  }

  if (errorsValidation.length > 0) {
    const error = new CustomError(400, 'Validation', 'Invalid input data', null, errorsValidation);
    return next(error);
  }

  return next();
};
