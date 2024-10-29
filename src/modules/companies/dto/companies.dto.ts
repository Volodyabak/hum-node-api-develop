import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCompanyDto {
  @IsNotEmpty()
  @ApiProperty()
  name: string;
}

export class CompanyIdDto {
  @IsNotEmpty()
  @IsUUID('4')
  @ApiProperty()
  companyId: string;
}

export class CompaniesContentParams extends CompanyIdDto {
  @IsNotEmpty()
  @ApiProperty()
  content: 'ballots' | 'brackhits';
}
