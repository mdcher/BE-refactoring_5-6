import { Loan } from '../../orm/entities/Loan';

export class LoanResponseDto {
  id: number;
  issueDate: string;
  dueDate: string;
  isReturned: boolean;
  returnDate: string | null;
  userId: number;
  book?: {
    id: number;
    title: string;
    status: string;
  };

  constructor(loan: Loan) {
    this.id = loan.id;
    this.issueDate =
      loan.issueDate instanceof Date
        ? loan.issueDate.toISOString().split('T')[0]
        : new Date(loan.issueDate).toISOString().split('T')[0];
    this.dueDate =
      loan.dueDate instanceof Date
        ? loan.dueDate.toISOString().split('T')[0]
        : new Date(loan.dueDate).toISOString().split('T')[0];
    this.isReturned = loan.isReturned;
    this.returnDate = loan.returnDate
      ? loan.returnDate instanceof Date
        ? loan.returnDate.toISOString().split('T')[0]
        : new Date(loan.returnDate).toISOString().split('T')[0]
      : null;
    this.userId = loan.userId;

    if (loan.book) {
      this.book = {
        id: loan.book.id,
        title: loan.book.title,
        status: loan.book.status,
      };
    }
  }
}
