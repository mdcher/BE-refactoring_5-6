import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { CustomError } from '../../../utils/response/custom-error/CustomError';

export const validatorUpdateLoan = (req: Request, _res: Response, next: NextFunction) => {
  const { issueDate, dueDate, isReturned, returnDate, userId, bookId } = req.body;
  const errorsValidation = [];

  // Перевіряємо тільки якщо поля передані (часткове оновлення)

  if (issueDate !== undefined && !validator.isDate(issueDate)) {
    errorsValidation.push({ issueDate: 'Issue date must be a valid date (YYYY-MM-DD)' });
  }

  if (dueDate !== undefined && !validator.isDate(dueDate)) {
    errorsValidation.push({ dueDate: 'Due date must be a valid date (YYYY-MM-DD)' });
  }

  // Перевірка що dueDate пізніше за issueDate (якщо обидва передані)
  if (issueDate && dueDate && validator.isDate(issueDate) && validator.isDate(dueDate)) {
    const issue = new Date(issueDate);
    const due = new Date(dueDate);
    if (due <= issue) {
      errorsValidation.push({ dueDate: 'Due date must be after issue date' });
    }
  }

  if (isReturned !== undefined && typeof isReturned !== 'boolean') {
    errorsValidation.push({ isReturned: 'isReturned must be a boolean' });
  }

  if (returnDate !== undefined && returnDate !== null && !validator.isDate(returnDate)) {
    errorsValidation.push({ returnDate: 'Return date must be a valid date (YYYY-MM-DD) or null' });
  }

  if (userId !== undefined && !validator.isInt(String(userId), { min: 1 })) {
    errorsValidation.push({ userId: 'User ID must be a valid positive integer' });
  }

  if (bookId !== undefined && !validator.isInt(String(bookId), { min: 1 })) {
    errorsValidation.push({ bookId: 'Book ID must be a valid positive integer' });
  }

  if (errorsValidation.length > 0) {
    const error = new CustomError(400, 'Validation', 'Invalid input data', null, null, errorsValidation);
    return next(error);
  }

  return next();
};
