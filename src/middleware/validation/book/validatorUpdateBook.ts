import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { BookStatus } from '../../../orm/enums/BookStatus';
import { LanguageEnum } from '../../../orm/enums/Language';
import { CustomError } from '../../../utils/response/custom-error/CustomError';

export const validatorUpdateBook = (req: Request, _res: Response, next: NextFunction) => {
  const { title, year, publisher, language, status, location } = req.body;
  const errorsValidation = [];

  // Перевіряємо тільки якщо поля передані (часткове оновлення)

  if (title !== undefined && validator.isEmpty(title)) {
    errorsValidation.push({ title: 'Title cannot be empty' });
  }

  if (publisher !== undefined && validator.isEmpty(publisher)) {
    errorsValidation.push({ publisher: 'Publisher cannot be empty' });
  }

  if (year !== undefined && !validator.isInt(String(year), { min: 1900, max: new Date().getFullYear() + 1 })) {
    errorsValidation.push({ year: 'Year must be a valid number (1900 - current year + 1)' });
  }

  if (location !== undefined && validator.isEmpty(location)) {
    errorsValidation.push({ location: 'Location cannot be empty' });
  }

  if (language !== undefined && !Object.values(LanguageEnum).includes(language)) {
    errorsValidation.push({
      language: `Language must be one of: ${Object.values(LanguageEnum).join(', ')}`,
    });
  }

  if (status !== undefined && !Object.values(BookStatus).includes(status)) {
    errorsValidation.push({
      status: `Status must be one of: ${Object.values(BookStatus).join(', ')}`,
    });
  }

  if (errorsValidation.length > 0) {
    const error = new CustomError(400, 'Validation', 'Invalid input data', null, null, errorsValidation);
    return next(error);
  }

  return next();
};
