import { CampaignModel, CompanyModel } from '../../../../database/Models';
import { ApiProperty } from '@nestjs/swagger';

export class CompaniesResponse extends CompanyModel {
  @ApiProperty({ type: [CampaignModel] })
  campaigns: CampaignModel[];
}
