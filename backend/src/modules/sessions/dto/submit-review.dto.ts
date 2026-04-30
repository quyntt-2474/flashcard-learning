import { IsEnum, IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export enum GradeEnum {
  AGAIN = 'AGAIN',
  HARD = 'HARD',
  GOOD = 'GOOD',
  EASY = 'EASY',
}

export class SubmitReviewDto {
  @Type(() => Number)
  @IsInt()
  cardId: number;

  @IsEnum(GradeEnum)
  grade: GradeEnum;
}
