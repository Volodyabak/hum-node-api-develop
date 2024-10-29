import { IsOptional, IsObject, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class FiltersDto {
  @IsOptional()
  @IsObject()
  filters: Record<string, any>;
}

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page: number = 1;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize: number = 25;

  get skip(): number {
    return (this.page - 1) * this.pageSize;
  }
}

export class CommonQueryDto extends FiltersDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => PaginationDto)
  pagination?: PaginationDto = new PaginationDto();

  @IsOptional()
  sort?: string | string[] = [];
}
