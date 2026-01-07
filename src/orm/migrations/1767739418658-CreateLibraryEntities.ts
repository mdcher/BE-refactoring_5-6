import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateLibraryEntities1767739418658 implements MigrationInterface {
  name = 'CreateLibraryEntities1767739418658';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Створюємо ENUM для мов
    await queryRunner.query(`
            CREATE TYPE "public"."books_language_enum" AS ENUM(
                'Українська', 'Англійська', 'Німецька', 'Французька', 
                'Іспанська', 'Румунська', 'Словацька'
            )
        `);

    // 2. Створюємо ENUM для статусів
    await queryRunner.query(`
            CREATE TYPE "public"."books_status_enum" AS ENUM('New', 'Good', 'Damaged', 'Lost')
        `);

    // 3. Створюємо таблицю Книг
    await queryRunner.query(`
            CREATE TABLE "books" (
                "bookid" SERIAL NOT NULL,
                "title" character varying(200) NOT NULL,
                "publisher" character varying(100) NOT NULL,
                "language" "public"."books_language_enum" NOT NULL,
                "year" integer NOT NULL,
                "location" character varying(100) NOT NULL,
                "status" "public"."books_status_enum" NOT NULL DEFAULT 'New',
                CONSTRAINT "PK_books_id" PRIMARY KEY ("bookid")
            )
        `);

    // 4. Створюємо таблицю Видач (Loans)
    await queryRunner.query(`
            CREATE TABLE "loans" (
                "loanid" SERIAL NOT NULL,
                "issuedate" date NOT NULL,
                "duedate" date NOT NULL,
                "isreturned" boolean NOT NULL DEFAULT false,
                "returndate" date,
                "userid" integer NOT NULL,
                "bookid" integer NOT NULL,
                CONSTRAINT "PK_loans_id" PRIMARY KEY ("loanid")
            )
        `);

    // 5. Додаємо зовнішній ключ: Loans -> Books
    await queryRunner.query(`
            ALTER TABLE "loans" 
            ADD CONSTRAINT "FK_loans_book" 
            FOREIGN KEY ("bookid") REFERENCES "books"("bookid") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);

    // (Зв'язок з users ми поки не додаємо жорстко, щоб уникнути помилок,
    // якщо ID користувачів не співпадають, але поле userid існуватиме)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Видалення у зворотному порядку
    await queryRunner.query(`ALTER TABLE "loans" DROP CONSTRAINT "FK_loans_book"`);
    await queryRunner.query(`DROP TABLE "loans"`);
    await queryRunner.query(`DROP TABLE "books"`);
    await queryRunner.query(`DROP TYPE "public"."books_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."books_language_enum"`);
  }
}
