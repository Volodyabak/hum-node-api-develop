import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { CampaignLogAction } from '@database/Models';

export class LogCampaignActionInput {
  @ApiProperty({
    example: CampaignLogAction.CTA_CLICK,
    enum: Object.values(CampaignLogAction),
  })
  @IsEnum(CampaignLogAction)
  action: CampaignLogAction;
  @ApiProperty({ required: false })
  userId?: string;
  @ApiProperty({ required: false })
  url?: string;
  @ApiProperty({ required: false })
  slug?: string;
  @ApiProperty({ required: false })
  data?: CampaignLogData;
}

export type CampaignLogData = LogVideoPlayDto;

export class LogVideoPlayDto {
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  playTime: number;
}
