import { getRepository } from 'typeorm';

import { CreateBookDto } from '../dto/book/create-book.dto';
import { Book } from '../orm/entities/Book';
import { CustomError } from '../utils/response/custom-error/CustomError';

export class BookService {
  async list(): Promise<Book[]> {
    const bookRepository = getRepository(Book);
    return bookRepository.find({
      relations: ['loans'],
    });
  }

  async one(id: number): Promise<Book> {
    const bookRepository = getRepository(Book);
    const book = await bookRepository.findOne(id, {
      relations: ['loans'],
    });

    if (!book) {
      throw new CustomError(404, 'General', 'Book not found');
    }

    return book;
  }

  async save(dto: CreateBookDto): Promise<Book> {
    const bookRepository = getRepository(Book);

    const existingBook = await bookRepository.findOne({ where: { title: dto.title } });
    if (existingBook) {
      throw new CustomError(400, 'Validation', 'Book with this title already exists');
    }

    const newBook = bookRepository.create(dto);
    return bookRepository.save(newBook);
  }

  async delete(id: number): Promise<void> {
    const bookRepository = getRepository(Book);
    const book = await this.one(id);
    await bookRepository.remove(book);
  }
}
