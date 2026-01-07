import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

import { Book } from './Book';

@Entity('loans')
export class Loan {
  @PrimaryGeneratedColumn({ name: 'loanid' })
  id: number;

  @Column({ name: 'issuedate', type: 'date' })
  issueDate: Date;

  @Column({ name: 'duedate', type: 'date' })
  dueDate: Date;

  @Column({ name: 'isreturned', default: false })
  isReturned: boolean;

  @Column({ name: 'returndate', type: 'date', nullable: true })
  returnDate: Date;

  @Column({ name: 'userid' }) // Для спрощення UserID поки лишаємо просто числом (бо ми робимо тільки 2 сутності)
  userId: number;

  // Зв'язок: Багато видач -> Одна книга
  @ManyToOne(() => Book, (book) => book.loans)
  @JoinColumn({ name: 'bookid' }) // Вказуємо FK колонку з SQL
  book: Book;

  @Column({ name: 'bookid' })
  bookId: number;
}
