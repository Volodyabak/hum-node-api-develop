import { CompanyIdDto } from '../../../companies/dto/companies.dto';
import { IsNotEmpty, IsString } from 'class-validator';

export class MailchimpCallbackInput extends CompanyIdDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
