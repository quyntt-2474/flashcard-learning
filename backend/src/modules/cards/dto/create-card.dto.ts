import { IsString, MinLength, MaxLength } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  front: string;

  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  back: string;
}
