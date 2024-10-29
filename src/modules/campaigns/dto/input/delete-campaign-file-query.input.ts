import { ApiProperty } from '@nestjs/swagger';
import { CompanyIdDto } from '../../../companies/dto/companies.dto';

export class DeleteCampaignFileQueryInput extends CompanyIdDto {
  @ApiProperty()
  link: string;
}
