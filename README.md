# TypeORM / Express / TypeScript RESTful API boilerplate

[![CI][build-badge]][build-url]
[![TypeScript][typescript-badge]][typescript-url]
[![prettier][prettier-badge]][prettier-url]
![Heisenberg](misc/heisenberg.png)

Boilerplate with focus on best practices and painless developer experience:

- Minimal setup that can be extended 🔧
- Spin it up with single command 🌀
- TypeScript first
- RESTful APIs
- JWT authentication with role based authorization

---

# Лабораторна робота №5-6: REST API для системи управління бібліотекою

## Сутності та зв'язки (ЛР №5)

### Book (Книга)

**Файл:** `src/orm/entities/Book.ts`

Атрибути:

- `id` (bookid) - унікальний ідентифікатор книги (SERIAL, PK)
- `title` - назва книги (VARCHAR(200), NOT NULL)
- `publisher` - видавництво (VARCHAR(100), NOT NULL)
- `language` - мова книги (ENUM: Українська, Англійська, Німецька, Французька, Іспанська, Румунська, Словацька)
- `year` - рік видання (INTEGER, NOT NULL)
- `location` - розташування в бібліотеці (VARCHAR(100), NOT NULL)
- `status` - стан книги (ENUM: New, Good, Damaged, Lost, DEFAULT: New)

### Loan (Видача книги)

**Файл:** `src/orm/entities/Loan.ts`

Атрибути:

- `id` (loanid) - унікальний ідентифікатор видачі (SERIAL, PK)
- `issueDate` - дата видачі книги (DATE, NOT NULL)
- `dueDate` - дата, до якої потрібно повернути (DATE, NOT NULL)
- `isReturned` - чи повернута книга (BOOLEAN, DEFAULT: false)
- `returnDate` - фактична дата повернення (DATE, NULLABLE)
- `userId` - ідентифікатор користувача (INTEGER, NOT NULL)
- `bookId` - ідентифікатор книги (INTEGER, NOT NULL, FK → books.bookid)

### Зв'язки між сутностями

**Book (1) ↔ (M) Loan** - One-to-Many

Одна книга може мати багато видач в історії, але кожна видача пов'язана тільки з однією книгою.

```typescript
// Book.ts
@OneToMany(() => Loan, (loan) => loan.book)
loans: Loan[];

// Loan.ts
@ManyToOne(() => Book, (book) => book.loans)
@JoinColumn({ name: 'bookid' })
book: Book;
```

**Діаграма зв'язків:**

```
┌─────────────────────┐            ┌─────────────────────┐
│      Book           │ 1        M │      Loan           │
├─────────────────────┤────────────├─────────────────────┤
│ id (PK)             │            │ id (PK)             │
│ title               │            │ issueDate           │
│ publisher           │            │ dueDate             │
│ language            │            │ isReturned          │
│ year                │            │ returnDate          │
│ location            │            │ userId              │
│ status              │            │ bookId (FK)         │
└─────────────────────┘            └─────────────────────┘
```

### Міграції

**Файл:** `src/orm/migrations/1767739418658-CreateLibraryEntities.ts`

Міграція створює:

1. ENUM тип для мов (`books_language_enum`)
2. ENUM тип для статусів (`books_status_enum`)
3. Таблицю `books` з усіма полями
4. Таблицю `loans` з усіма полями
5. Foreign Key constraint `FK_loans_book` (loans.bookid → books.bookid)

Міграція має метод `down()` для rollback змін.

**Важливо:** У production-коді використовується `synchronize: false` (файл `src/orm/config/ormconfig.ts:12`), тому всі зміни схеми БД виконуються через міграції.

## API Endpoints

### Books API

**Base URL:** `/api/v1/books`

| Метод  | Endpoint | Опис                              | Авторизація         | Валідація           |
| ------ | -------- | --------------------------------- | ------------------- | ------------------- |
| GET    | `/`      | Список всіх книг з історією видач | Ні                  | -                   |
| GET    | `/:id`   | Деталі однієї книги               | Ні                  | -                   |
| POST   | `/`      | Створення нової книги             | JWT + ADMINISTRATOR | validatorCreateBook |
| PUT    | `/:id`   | Оновлення книги                   | JWT + ADMINISTRATOR | validatorUpdateBook |
| DELETE | `/:id`   | Видалення книги                   | JWT + ADMINISTRATOR | -                   |

**Приклад відповіді GET /api/v1/books (з JOIN):**

```json
{
  "message": "List of books",
  "data": [
    {
      "id": 1,
      "bookTitle": "Clean Code",
      "publisher": "Prentice Hall",
      "language": "Англійська",
      "location": "A-12-3",
      "year": 2008,
      "status": "Good",
      "loanHistory": [
        {
          "id": 1,
          "issueDate": "2024-01-15",
          "dueDate": "2024-02-15",
          "isReturned": true,
          "returnDate": "2024-02-10",
          "userId": 2
        },
        {
          "id": 3,
          "issueDate": "2024-03-01",
          "dueDate": "2024-04-01",
          "isReturned": false,
          "returnDate": null,
          "userId": 3
        }
      ]
    }
  ]
}
```

### Loans API

**Base URL:** `/api/v1/loans`

| Метод  | Endpoint | Опис                               | Авторизація         | Валідація           |
| ------ | -------- | ---------------------------------- | ------------------- | ------------------- |
| GET    | `/`      | Список всіх видач з інфо про книгу | Ні                  | -                   |
| GET    | `/:id`   | Деталі однієї видачі               | Ні                  | -                   |
| POST   | `/`      | Створення нової видачі             | JWT + ADMINISTRATOR | validatorCreateLoan |
| PUT    | `/:id`   | Оновлення видачі                   | JWT + ADMINISTRATOR | validatorUpdateLoan |
| DELETE | `/:id`   | Видалення видачі                   | JWT + ADMINISTRATOR | -                   |

**Приклад відповіді GET /api/v1/loans (з JOIN):**

```json
{
  "message": "List of loans",
  "data": [
    {
      "id": 1,
      "issueDate": "2024-01-15",
      "dueDate": "2024-02-15",
      "isReturned": true,
      "returnDate": "2024-02-10",
      "userId": 2,
      "book": {
        "id": 1,
        "title": "Clean Code",
        "status": "Good"
      }
    }
  ]
}
```

---

## Архітектура (ЛР №6)

### Layered Architecture

Проєкт використовує шарову архітектуру:

```
HTTP Request
    ↓
Middleware (Validation) ← Validator використовує validator.js
    ↓
Controller ← Обробляє запит, викликає сервіс
    ↓
Service ← Бізнес-логіка, робота з Repository
    ↓
Repository (TypeORM) ← Доступ до БД
    ↓
Database (PostgreSQL)
```

**Принципи:**

- **Controller** тільки приймає запити та викликає сервіси. НЕ має прямого доступу до Repository.
- **Service** містить всю бізнес-логіку та працює з TypeORM Repository через `getRepository()`.
- **Middleware-валідація** перевіряє вхідні дані перед контролером і викидає `CustomError` при помилках.
- **DTO (Response)** трансформує entity перед відправкою клієнту, приховує службові поля.

### Приклади реалізації (ЛР №6)

#### 1. Middleware-валідатор

**Файл:** `src/middleware/validation/book/validatorCreateBook.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import validator from 'validator';

import { BookStatus } from '../../../orm/enums/BookStatus';
import { LanguageEnum } from '../../../orm/enums/Language';
import { CustomError } from '../../../utils/response/custom-error/CustomError';

export const validatorCreateBook = (req: Request, _res: Response, next: NextFunction) => {
  const { title, year, publisher, language, status, location } = req.body;
  const errorsValidation = [];

  // Перевірка title
  if (!title || validator.isEmpty(title)) {
    errorsValidation.push({ title: 'Title is required' });
  }

  // Перевірка publisher
  if (!publisher || validator.isEmpty(publisher)) {
    errorsValidation.push({ publisher: 'Publisher is required' });
  }

  // Перевірка year
  if (!year || !validator.isInt(String(year), { min: 1900, max: new Date().getFullYear() + 1 })) {
    errorsValidation.push({ year: 'Year must be a valid number (1900 - current year + 1)' });
  }

  // Перевірка location
  if (!location || validator.isEmpty(location)) {
    errorsValidation.push({ location: 'Location is required' });
  }

  // Перевірка language (enum)
  if (!language || !Object.values(LanguageEnum).includes(language)) {
    errorsValidation.push({
      language: `Language must be one of: ${Object.values(LanguageEnum).join(', ')}`,
    });
  }

  // Перевірка status (enum)
  if (!status || !Object.values(BookStatus).includes(status)) {
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
```

**Використання в роуті:**

```typescript
// src/routes/v1/books.ts
router.post('/', [checkJwt, checkRole(['ADMINISTRATOR']), validatorCreateBook], bookController.save);
```

#### 2. Service-клас

**Файл:** `src/services/BookService.ts`

```typescript
import { getRepository } from 'typeorm';

import { CreateBookDto } from '../dto/book/create-book.dto';
import { Book } from '../orm/entities/Book';
import { CustomError } from '../utils/response/custom-error/CustomError';

export class BookService {
  async list(): Promise<Book[]> {
    const bookRepository = getRepository(Book);
    return bookRepository.find({
      relations: ['loans'], // JOIN з таблицею loans
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

      if (dto.title && dto.title !== book.title) {
        const existingBook = await bookRepository.findOne({ where: { title: dto.title } });
        if (existingBook) {
          throw new CustomError(400, 'Validation', 'Book with this title already exists');
        }
      }

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
```

**Контролер використовує ТІЛЬКИ сервіс:**

```typescript
// src/controllers/BookController.ts
export class BookController {
  private bookService = new BookService(); // ✅ Використовуємо сервіс

  list = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await this.bookService.list(); // ✅ НЕ getRepository()
      const booksDto = books.map((book) => new BookResponseDto(book));
      res.customSuccess(200, 'List of books', booksDto);
    } catch (err) {
      next(err);
    }
  };

  // інші методи...
}
```

#### 3. ResponseDTO

**Файл:** `src/dto/book/book-response.dto.ts`

```typescript
import { Book } from '../../orm/entities/Book';
import { LoanResponseDto } from '../loan/loan-response.dto';

export class BookResponseDto {
  id: number;
  bookTitle: string; // ← Перейменоване з 'title'
  publisher: string;
  language: string;
  location: string;
  year: number;
  status: string;
  loanHistory: LoanResponseDto[]; // ← Трансформовані loans

  constructor(book: Book) {
    this.id = book.id;
    this.bookTitle = book.title; // Трансформація назви поля
    this.publisher = book.publisher;
    this.language = book.language;
    this.location = book.location;
    this.year = book.year;
    this.status = book.status;
    // Мапимо кожен loan через LoanResponseDto
    this.loanHistory = book.loans?.map((loan) => new LoanResponseDto(loan)) || [];
  }
}
```

**Файл:** `src/dto/loan/loan-response.dto.ts`

```typescript
import { Loan } from '../../orm/entities/Loan';

export class LoanResponseDto {
  id: number;
  issueDate: string; // ← Форматовано як рядок YYYY-MM-DD
  dueDate: string; // ← Форматовано як рядок YYYY-MM-DD
  isReturned: boolean;
  returnDate: string | null;
  userId: number;
  book?: {
    // ← Вкладений об'єкт (не повний entity)
    id: number;
    title: string;
    status: string;
  };

  constructor(loan: Loan) {
    this.id = loan.id;
    this.issueDate = loan.issueDate.toISOString().split('T')[0]; // Форматування дати
    this.dueDate = loan.dueDate.toISOString().split('T')[0];
    this.isReturned = loan.isReturned;
    this.returnDate = loan.returnDate ? loan.returnDate.toISOString().split('T')[0] : null;
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
```

**Переваги DTO:**

- ✅ Приховує службові поля entity (createdAt, updatedAt тощо)
- ✅ Дозволяє перейменовувати поля (title → bookTitle)
- ✅ Форматує дати у зрозумілий формат
- ✅ Запобігає циклічним залежностям при серіалізації
- ✅ Контролює які саме дані йдуть клієнту

#### 4. ErrorHandler з CustomError

**Файл:** `src/middleware/errorHandler.ts`

```typescript
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/response/custom-error/CustomError';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);

  // Якщо це наш CustomError, використовуємо його JSON метод
  if (err instanceof CustomError) {
    return res.status(err.HttpStatusCode).json(err.JSON);
  }

  // Обробка інших помилок
  return res.status(500).json({
    errorType: 'General',
    errorMessage: err.message || 'Internal Server Error',
    errors: null,
    errorRaw: process.env.NODE_ENV === 'dev' ? err : null,
    errorsValidation: null,
    stack: process.env.NODE_ENV === 'dev' ? err.stack : undefined,
  });
};
```

### Приклади роботи API

#### ✅ Успішна відповідь (201 Created)

**Request:** `POST /api/v1/books`

```json
{
  "title": "Design Patterns",
  "publisher": "Addison-Wesley",
  "language": "Англійська",
  "year": 1994,
  "location": "B-5-12",
  "status": "New"
}
```

**Response:**

```json
{
  "message": "Book created",
  "data": {
    "id": 5,
    "bookTitle": "Design Patterns",
    "publisher": "Addison-Wesley",
    "language": "Англійська",
    "location": "B-5-12",
    "year": 1994,
    "status": "New",
    "loanHistory": []
  }
}
```

#### ❌ Помилка валідації (400 Bad Request)

**Request:** `POST /api/v1/books`

```json
{
  "title": "",
  "year": 1800,
  "language": "InvalidLanguage"
}
```

**Response:**

```json
{
  "errorType": "Validation",
  "errorMessage": "Invalid input data",
  "errors": null,
  "errorRaw": null,
  "errorsValidation": [
    { "title": "Title is required" },
    { "publisher": "Publisher is required" },
    { "year": "Year must be a valid number (1900 - current year + 1)" },
    { "location": "Location is required" },
    {
      "language": "Language must be one of: Українська, Англійська, Німецька, Французька, Іспанська, Румунська, Словацька"
    },
    { "status": "Status must be one of: New, Good, Damaged, Lost" }
  ],
  "stack": null
}
```

---

## Requirements

- [Node v16+](https://nodejs.org/)
- [Docker](https://www.docker.com/)

## Running

_Easily set up a local development environment with single command!_

- clone the repo
- `npm run docker:dev` 🚀

Visit [localhost:4000](http://localhost:4000/) or if using Postman grab [config](/postman).

### _What happened_ 💥

Containers created:

- Postgres database container seeded with 💊 Breaking Bad characters in `Users` table (default credentials `user=walter`, `password=white` in [.env file](./.env))
- Node (v16 Alpine) container with running boilerplate RESTful API service
- and one Node container instance to run tests locally or in CI

## Features:

- [Express](https://github.com/expressjs/express) framework
- [TypeScript v4](https://github.com/microsoft/TypeScript) codebase
- [TypeORM](https://typeorm.io/) using Data Mapper pattern
- [Docker](https://www.docker.com/) environment:
  - Easily start local development using [Docker Compose](https://docs.docker.com/compose/) with single command `npm run docker:dev`
  - Connect to different staging or production environments `npm run docker:[stage|prod]`
  - Ready for **microservices** development and deployment.  
    Once API changes are made, just build and push new docker image with your favourite CI/CD tool  
    `docker build -t <username>/api-boilerplate:latest .`  
    `docker push <username>/api-boilerplate:latest`
  - Run unit, integration (or setup with your frontend E2E) tests as `docker exec -ti be_boilerplate_test sh` and `npm run test`
- Contract first REST API design:
  - never break API again with HTTP responses and requests payloads using [type definitions](./src/types/express/index.d.ts)
  - Consistent schema error [response](./src/utils/response/custom-error/types.ts). Your frontend will always know how to handle errors thrown in `try...catch` statements 💪
- JWT authentication and role based authorization using custom middleware
- Set local, stage or production [environmental variables](./config) with [type definitions](./src/types/ProcessEnv.d.ts)
- Logging with [morgan](https://github.com/expressjs/morgan)
- Unit and integration tests with [Mocha](https://mochajs.org/) and [Chai](https://www.chaijs.com/)
- Linting with [ESLint](https://eslint.org/)
- [Prettier](https://prettier.io/) code formatter
- Git hooks with [Husky](https://github.com/typicode/husky) and [lint-staged](https://github.com/okonet/lint-staged)
- Automated npm & Docker dependency updates with [Renovate](https://github.com/renovatebot/renovate) (set to patch version only)
- Commit messages must meet [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format.  
  After staging changes just run `npm run commit` and get instant feedback on your commit message formatting and be prompted for required fields by [Commitizen](https://github.com/commitizen/cz-cli)

## Other awesome boilerplates:

Each boilerplate comes with it's own flavor of libraries and setup, check out others:

- [Express and TypeORM with TypeScript](https://github.com/typeorm/typescript-express-example)
- [Node.js, Express.js & TypeScript Boilerplate for Web Apps](https://github.com/jverhoelen/node-express-typescript-boilerplate)
- [Express boilerplate for building RESTful APIs](https://github.com/danielfsousa/express-rest-es2017-boilerplate)
- [A delightful way to building a RESTful API with NodeJs & TypeScript by @w3tecch](https://github.com/w3tecch/express-typescript-boilerplate)

[build-badge]: https://github.com/mkosir/express-typescript-typeorm-boilerplate/actions/workflows/main.yml/badge.svg
[build-url]: https://github.com/mkosir/express-typescript-typeorm-boilerplate/actions/workflows/main.yml
[typescript-badge]: https://badges.frapsoft.com/typescript/code/typescript.svg?v=101
[typescript-url]: https://github.com/microsoft/TypeScript
[prettier-badge]: https://img.shields.io/badge/code_style-prettier-ff69b4.svg
[prettier-url]: https://github.com/prettier/prettier

## Contributing

All contributions are welcome!
