import { Request, Response, NextFunction } from 'express';

import { BookResponseDto } from '../dto/book/book-response.dto';
import { BookService } from '../services/BookService';

export class BookController {
  private bookService = new BookService();

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await this.bookService.list();
      const booksDto = books.map((book) => new BookResponseDto(book));
      res.customSuccess(200, 'List of books', booksDto);
    } catch (err) {
      next(err);
    }
  };

  one = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const book = await this.bookService.one(Number(req.params.id));
      res.customSuccess(200, 'Book details', new BookResponseDto(book));
    } catch (err) {
      next(err);
    }
  };

  save = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const book = await this.bookService.save(req.body);
      res.customSuccess(201, 'Book created', new BookResponseDto(book));
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.bookService.delete(Number(req.params.id));
      res.customSuccess(200, 'Book deleted');
    } catch (err) {
      next(err);
    }
  };
}
