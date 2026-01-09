import { IsBoolean, IsDateString, IsInt, IsOptional } from 'class-validator';

export class CreateLoanDto {
  @IsDateString()
  issueDate: string;

  @IsDateString()
  dueDate: string;

  @IsBoolean()
  @IsOptional()
  isReturned?: boolean;

  @IsDateString()
  @IsOptional()
  returnDate?: string;

  @IsInt()
  userId: number;

  @IsInt()
  bookId: number;
}
