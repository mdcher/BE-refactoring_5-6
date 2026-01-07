import { Book } from '../../orm/entities/Book';
import { Loan } from '../../orm/entities/Loan';

export class BookResponseDto {
  id: number;
  bookTitle: string;
  publisher: string;
  year: number;
  status: string;
  history: Loan[];

  constructor(book: Book) {
    this.id = book.id;
    this.bookTitle = book.title;
    this.publisher = book.publisher;
    this.year = book.year;
    this.status = book.status;
    this.history = book.loans || [];
  }
}
