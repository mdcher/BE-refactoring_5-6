import { Book } from '../../orm/entities/Book';
import { LoanResponseDto } from '../loan/loan-response.dto';

export class BookResponseDto {
  id: number;
  bookTitle: string;
  publisher: string;
  language: string;
  location: string;
  year: number;
  status: string;
  loanHistory: LoanResponseDto[];

  constructor(book: Book) {
    this.id = book.id;
    this.bookTitle = book.title;
    this.publisher = book.publisher;
    this.language = book.language;
    this.location = book.location;
    this.year = book.year;
    this.status = book.status;
    this.loanHistory = book.loans?.map((loan) => new LoanResponseDto(loan)) || [];
  }
}
