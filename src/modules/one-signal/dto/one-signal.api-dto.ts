import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Max, Min } from 'class-validator';

export class AddEmailsQueryDto {
  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;
  @ApiProperty()
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5000)
  take: number = 5000;
}
