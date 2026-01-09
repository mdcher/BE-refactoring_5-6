import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

import { BookStatus } from '../enums/BookStatus';
import { LanguageEnum } from '../enums/Language';

import { Loan } from './Loan';

@Entity('books') // Вказуємо точну назву таблиці з SQL файлу
export class Book {
  @PrimaryGeneratedColumn({ name: 'bookid' }) // SQL: BookID SERIAL
  id: number;

  @Column({ name: 'title', length: 200 })
  title: string;

  @Column({ name: 'publisher', length: 100 }) // ВИПРАВЛЕНО: було 'puAblisher'
  publisher: string;

  @Column({
    type: 'enum',
    enum: LanguageEnum,
    name: 'language',
  })
  language: LanguageEnum;

  @Column({ name: 'year' })
  year: number;

  @Column({ name: 'location', length: 100 })
  location: string;

  @Column({
    type: 'enum',
    enum: BookStatus,
    default: BookStatus.NEW,
    name: 'status',
  })
  status: BookStatus;

  // Зв'язок: Одна книга -> Багато видач
  @OneToMany(() => Loan, (loan) => loan.book)
  loans: Loan[];
}
