# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development

- `npm run dev` - Start development server with hot reload (runs on port 4000)
- `npm run build` - Compile TypeScript to JavaScript (output: `./dist`)
- `npm start` - Run production build
- `npm run docker:dev` - Spin up full development environment with Docker Compose (database + API)
- `npm run docker:stage` - Run staging environment
- `npm run docker:prod` - Run production environment

### Testing

- `npm test` - Run all tests (Mocha with ts-node, 20s timeout)

### Linting and Formatting

- `npm run lint` - Run ESLint and TypeScript compiler check
- `npm run lint-fix` - Auto-fix ESLint issues
- `npm run tsc` - Type check without emitting files
- `npm run format-lint` - Check formatting with Prettier
- `npm run format-fix` - Auto-format code with Prettier

### Database Migrations

- `npm run migration:run` - Run pending migrations (Docker environment)
- `npm run migration:run:dev` - Run migrations (local development with PG_HOST=localhost)
- `npm run migration:revert` - Revert last migration
- `npm run migration:generate -- -n MigrationName` - Generate migration from entity changes
- `npm run migration:create -- -n MigrationName` - Create empty migration file

### Database Seeds

- `npm run seed:run` - Run seeds (Docker environment)
- `npm run seed:run:dev` - Run seeds (local development)
- `npm run seed:create -- -n SeedName` - Create new seed file

### Git

- `npm run commit` - Interactive commit with Commitizen (enforces conventional commits)

## Architecture Overview

### Project Structure

```
src/
├── controllers/     # Request handlers (Controller classes with methods)
├── services/        # Business logic layer (Service classes)
├── routes/          # Route definitions (v1/, pages/)
├── middleware/      # Express middleware (auth, validation, error handling)
├── orm/
│   ├── entities/    # TypeORM entities (database models)
│   ├── migrations/  # Database migrations
│   ├── seeds/       # Database seeds
│   ├── enums/       # Enum definitions
│   └── config/      # ORM configuration
├── dto/             # Data Transfer Objects
├── types/           # TypeScript type definitions
└── utils/           # Utility functions and helpers
```

### Core Technologies

- **Express.js** - Web framework
- **TypeORM 0.2** - ORM with Data Mapper pattern, PostgreSQL
- **TypeScript 4.6** - Type-safe development
- **JWT** - Authentication and authorization
- **class-validator** - Request validation
- **Mocha + Chai** - Testing framework

### Architecture Pattern: Layered Architecture

**Controller → Service → Repository (TypeORM)**

1. **Controllers** (`src/controllers/`)

   - Handle HTTP requests/responses
   - Delegate business logic to services
   - Use DTOs for response formatting
   - Example: `BookController` with methods: `list`, `one`, `save`, `update`, `delete`

2. **Services** (`src/services/`)

   - Contain business logic
   - Interact with TypeORM repositories via `getRepository()`
   - Throw `CustomError` for error handling
   - Example: `BookService` handles CRUD operations and validation

3. **Routes** (`src/routes/`)
   - Define endpoints with middleware chains
   - Organized by version (`v1/`)
   - Middleware order: validation → auth (`checkJwt`) → authorization (`checkRole`) → controller
   - Main routes mounted in `src/routes/index.ts`

### Database Configuration

**TypeORM Setup:**

- Connection config: `src/orm/config/ormconfig.ts`
- Uses `SnakeNamingStrategy` (camelCase in code → snake_case in DB)
- Connection helper: `src/orm/dbCreateConnection.ts`
- `synchronize: false` - migrations required for schema changes

**Entities:**

- Decorated with TypeORM decorators (`@Entity`, `@Column`, etc.)
- Column names explicitly mapped with `name` property
- Relations: `Book` ↔ `Loan` (one-to-many)

### Authentication & Authorization

**JWT Flow:**

1. Login via `/api/v1/auth/login` → returns JWT token
2. Protected routes use `checkJwt` middleware (validates token, extracts payload)
3. Token automatically refreshed on every request (new token in response header)
4. `checkRole` middleware enforces role-based access (ADMINISTRATOR, STANDARD)

**Middleware Chain:**

```typescript
[checkJwt, checkRole(['ADMINISTRATOR']), validator, controller];
```

### Error Handling

**CustomError Pattern:**

- All errors extend `CustomError` class (`src/utils/response/custom-error/CustomError.ts`)
- Constructor: `(httpStatusCode, errorType, message, errors?, errorRaw?, errorsValidation?)`
- Centralized error handler: `errorHandler` middleware in `src/middleware/errorHandler.ts`
- Services throw `CustomError`, controllers catch and pass to `next(err)`

**Success Response Pattern:**

- Custom method added to Express Response: `res.customSuccess(code, message, data?)`
- Defined in `src/utils/response/customSuccess.ts`

### Request Validation

**class-validator Pattern:**

- Validators in `src/middleware/validation/`
- Use `class-validator` decorators on DTO classes
- Validator middleware checks body/params and throws `CustomError` with validation details
- Example: `validatorCreateBook` validates request body against `CreateBookDto`

### TypeScript Configuration

**Important Settings:**

- `baseUrl: "src/"` - allows imports without relative paths
- `NODE_PATH=./src` - set in npm scripts for runtime resolution
- Custom type definitions in `src/types/` (Express extensions, JwtPayload, ProcessEnv)
- Decorators enabled for TypeORM (`experimentalDecorators`, `emitDecoratorMetadata`)

### Express Type Extensions

**Custom Request/Response Properties:**

```typescript
// src/types/express/index.d.ts
Request.jwtPayload: JwtPayload  // Added by checkJwt middleware
Request.language: Language      // Added by getLanguage middleware
Response.customSuccess()        // Custom success response method
```

### Environment Variables

- Configuration in `.env` file (DO NOT COMMIT PRODUCTION SECRETS)
- Type definitions in `src/types/ProcessEnv.d.ts`
- Required variables: `PORT`, database config (`PG_HOST`, `PG_PORT`, etc.), `JWT_SECRET`, `JWT_EXPIRATION`
- Docker environment uses `PG_HOST=db_boilerplate`
- Local development uses `PG_HOST=localhost`

### Docker Setup

**Default Credentials:**

- Database: `user=walter`, `password=white`, `db=boilerplate`
- Seeded with Breaking Bad characters in Users table

**Containers:**

- PostgreSQL database (`db_boilerplate`)
- Node API service (port 4000)
- Test runner container (`be_boilerplate_test`)

**Running Tests in Docker:**

```bash
docker exec -ti be_boilerplate_test sh
npm run test
```

### Current Domain: Library Management System

The codebase includes a library management feature with:

- **Books** entity: tracks books with title, publisher, language, year, location, status
- **Loans** entity: tracks book loans with issue/due/return dates
- **Book CRUD**: `/api/v1/books` endpoints (list, show, create, update, delete)
- **Authorization**: Book mutations (POST/PUT/DELETE) require ADMINISTRATOR role

### Key Implementation Patterns

1. **Service Layer Pattern**: Business logic isolated in service classes
2. **DTO Pattern**: Response shaping with DTO classes (e.g., `BookResponseDto`)
3. **Repository Pattern**: TypeORM repositories accessed via `getRepository(Entity)`
4. **Middleware Chaining**: Validation → Authentication → Authorization → Controller
5. **Error Propagation**: Services throw `CustomError`, controllers catch and pass to error handler
6. **Path Aliases**: TypeScript baseUrl enables clean imports (`import from 'controllers/...'`)

### Important Notes

- **Line Endings**: Git configured to handle line endings (see `.gitattributes`)
- **Commit Convention**: Uses conventional commits enforced by commitlint
- **Pre-commit Hooks**: Husky runs lint-staged before commits
- **TypeORM Version**: 0.2.x (older version with different API than 0.3+)
