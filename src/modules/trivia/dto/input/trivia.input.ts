import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class TriviaParamsDto {
  @ApiProperty()
  @IsNumber()
  id: number;
}
