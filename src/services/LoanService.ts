import { getRepository } from 'typeorm';

import { CreateLoanDto } from '../dto/loan/create-loan.dto';
import { Book } from '../orm/entities/Book';
import { Loan } from '../orm/entities/Loan';
import { CustomError } from '../utils/response/custom-error/CustomError';

export class LoanService {
  async list(): Promise<Loan[]> {
    const loanRepository = getRepository(Loan);
    return loanRepository.find({
      relations: ['book'],
    });
  }

  async one(id: number): Promise<Loan> {
    const loanRepository = getRepository(Loan);
    const loan = await loanRepository.findOne(id, {
      relations: ['book'],
    });

    if (!loan) {
      throw new CustomError(404, 'General', 'Loan not found');
    }

    return loan;
  }

  async save(dto: CreateLoanDto): Promise<Loan> {
    const loanRepository = getRepository(Loan);
    const bookRepository = getRepository(Book);

    try {
      // Перевіряємо чи існує книга з таким ID
      const book = await bookRepository.findOne(dto.bookId);
      if (!book) {
        throw new CustomError(404, 'Validation', 'Book with this ID does not exist');
      }

      // Конвертуємо дати зі строк у Date об'єкти
      const newLoan = loanRepository.create({
        issueDate: new Date(dto.issueDate),
        dueDate: new Date(dto.dueDate),
        isReturned: dto.isReturned || false,
        returnDate: dto.returnDate ? new Date(dto.returnDate) : null,
        userId: dto.userId,
        bookId: dto.bookId,
      });

      const savedLoan = await loanRepository.save(newLoan);

      // Повертаємо з relations
      return this.one(savedLoan.id);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(500, 'General', 'Failed to save loan');
    }
  }

  async update(id: number, dto: Partial<CreateLoanDto>): Promise<Loan> {
    const loanRepository = getRepository(Loan);
    const bookRepository = getRepository(Book);

    try {
      const loan = await this.one(id);

      // Якщо змінюють bookId, перевіряємо чи існує така книга
      if (dto.bookId && dto.bookId !== loan.bookId) {
        const book = await bookRepository.findOne(dto.bookId);
        if (!book) {
          throw new CustomError(404, 'Validation', 'Book with this ID does not exist');
        }
      }

      // Оновлюємо тільки передані поля, конвертуючи дати
      if (dto.issueDate) {
        loan.issueDate = new Date(dto.issueDate);
      }
      if (dto.dueDate) {
        loan.dueDate = new Date(dto.dueDate);
      }
      if (dto.isReturned !== undefined) {
        loan.isReturned = dto.isReturned;
      }
      if (dto.returnDate !== undefined) {
        loan.returnDate = dto.returnDate ? new Date(dto.returnDate) : null;
      }
      if (dto.userId) {
        loan.userId = dto.userId;
      }
      if (dto.bookId) {
        loan.bookId = dto.bookId;
      }

      await loanRepository.save(loan);

      // Повертаємо оновлений loan з relations
      return this.one(id);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(500, 'General', 'Failed to update loan');
    }
  }

  async delete(id: number): Promise<void> {
    const loanRepository = getRepository(Loan);
    const loan = await this.one(id);
    await loanRepository.remove(loan);
  }
}
