import { ApiProperty } from '@nestjs/swagger';

import { CampaignChoice } from '../campaign.dto';

export class CreateCampaignBrackhitAnswerKeysInput {
  @ApiProperty({ type: CampaignChoice, isArray: true })
  choices: CampaignChoice[];
}
