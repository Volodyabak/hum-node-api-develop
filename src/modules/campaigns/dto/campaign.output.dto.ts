import { ApiProperty } from '@nestjs/swagger';

import { CampaignModel, CampaignUserModel } from '@database/Models';
import { PaginationResponseDto } from '../../../Tools/dto/main-api.dto';

export class CampaignSearchResponse {
  @ApiProperty({ type: CampaignModel, isArray: true })
  data: CampaignModel[];
  @ApiProperty()
  pagination: PaginationResponseDto;
}

export class SubmitCampaignResponse {
  @ApiProperty()
  user: CampaignUserModel;
}
