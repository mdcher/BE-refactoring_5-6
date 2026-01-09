import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from '../../../utils/response/custom-error/CustomError';

export const validatorCreateLoan = (req: Request, _res: Response, next: NextFunction) => {
  const { issueDate, dueDate, userId, bookId } = req.body;
  const errorsValidation = [];

  // Перевірка issueDate
  if (!issueDate || !validator.isDate(issueDate)) {
    errorsValidation.push({ issueDate: 'Issue date must be a valid date (YYYY-MM-DD)' });
  }

  // Перевірка dueDate
  if (!dueDate || !validator.isDate(dueDate)) {
    errorsValidation.push({ dueDate: 'Due date must be a valid date (YYYY-MM-DD)' });
  }

  // Перевірка що dueDate пізніше за issueDate
  if (issueDate && dueDate && validator.isDate(issueDate) && validator.isDate(dueDate)) {
    const issue = new Date(issueDate);
    const due = new Date(dueDate);
    if (due <= issue) {
      errorsValidation.push({ dueDate: 'Due date must be after issue date' });
    }
  }

  // Перевірка userId
  if (!userId || !validator.isInt(String(userId), { min: 1 })) {
    errorsValidation.push({ userId: 'User ID must be a valid positive integer' });
  }

  // Перевірка bookId
  if (!bookId || !validator.isInt(String(bookId), { min: 1 })) {
    errorsValidation.push({ bookId: 'Book ID must be a valid positive integer' });
  }

  if (errorsValidation.length > 0) {
    const error = new CustomError(400, 'Validation', 'Invalid input data', null, null, errorsValidation);
    return next(error);
  }

  return next();
};
