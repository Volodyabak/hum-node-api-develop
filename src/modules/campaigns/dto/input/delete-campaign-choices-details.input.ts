import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteCampaignChoicesDetailsInput {
  @ApiProperty()
  @Type(() => DeleteCampaignChoiceDetails)
  choices: DeleteCampaignChoiceDetails[];
}

class DeleteCampaignChoiceDetails {
  @ApiProperty()
  choiceId: number;
}
