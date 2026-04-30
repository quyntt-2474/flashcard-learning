import { IsInt } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateSessionDto {
  @Type(() => Number)
  @IsInt()
  deckId: number;
}
