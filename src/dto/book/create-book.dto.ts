import { IsEnum, IsInt, IsString, Min } from 'class-validator';

import { BookStatus } from '../../orm/enums/BookStatus';
import { LanguageEnum } from '../../orm/enums/Language';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  publisher: string;

  @IsEnum(LanguageEnum)
  language: LanguageEnum;

  @IsInt()
  @Min(1900)
  year: number;

  @IsString()
  location: string;

  @IsEnum(BookStatus)
  status: BookStatus;
}
