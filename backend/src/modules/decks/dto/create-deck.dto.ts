import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDeckDto {
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  categoryId?: number;
}
