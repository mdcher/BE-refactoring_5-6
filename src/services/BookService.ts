import { getRepository } from 'typeorm';

import { CreateBookDto } from '../dto/book/create-book.dto';
import { Book } from '../orm/entities/Book';
import { CustomError } from '../utils/response/custom-error/CustomError';

export class BookService {
  async list(): Promise<Book[]> {
    const bookRepository = getRepository(Book);
    const books = await bookRepository.find({
      relations: ['loans'],
    });
    console.log('--- Data found by bookService.list ---');
    console.log(books);
    return books;
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

    try {
      const existingBook = await bookRepository.findOne({ where: { title: dto.title } });
      if (existingBook) {
        throw new CustomError(400, 'Validation', 'Book with this title already exists');
      }

      const newBook = bookRepository.create(dto);
      return await bookRepository.save(newBook);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(500, 'General', 'Failed to save book');
    }
  }

  async update(id: number, dto: Partial<CreateBookDto>): Promise<Book> {
    const bookRepository = getRepository(Book);

    try {
      const book = await this.one(id);

      // Перевіряємо чи не намагаються змінити title на вже існуючий
      if (dto.title && dto.title !== book.title) {
        const existingBook = await bookRepository.findOne({ where: { title: dto.title } });
        if (existingBook) {
          throw new CustomError(400, 'Validation', 'Book with this title already exists');
        }
      }

      // Оновлюємо тільки передані поля
      Object.assign(book, dto);

      return await bookRepository.save(book);
    } catch (error) {
      if (error instanceof CustomError) {
        throw error;
      }
      throw new CustomError(500, 'General', 'Failed to update book');
    }
  }

  async delete(id: number): Promise<void> {
    const bookRepository = getRepository(Book);
    const book = await this.one(id);
    await bookRepository.remove(book);
  }
}
