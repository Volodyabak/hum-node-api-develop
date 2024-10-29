import { ApiProperty } from '@nestjs/swagger';

import { CAMPAIGN_TYPE_NAME } from '../../constants/campaign.constants';
import { CampaignData } from '../../types/campaign-data.type';
import { IsNotEmpty } from 'class-validator';

export class UpdateCampaignInput {
  @ApiProperty({ required: true, enum: Object.values(CAMPAIGN_TYPE_NAME) })
  campaignType: CAMPAIGN_TYPE_NAME;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  gameId: number | string;

  @ApiProperty({ required: true })
  name: string;

  @ApiProperty({ required: true })
  publicName: string;

  @ApiProperty({ required: true })
  data: CampaignData;

  @ApiProperty({ required: true })
  link: string;

  @ApiProperty({ required: false })
  termLink: string;

  @ApiProperty({ required: false })
  redirectUrl: string;

  @ApiProperty({ required: false, enum: [0, 1] })
  userDetailsPlacement: 0 | 1;

  @ApiProperty({ required: true, enum: [0, 1] })
  useCustomNames: 0 | 1;

  @ApiProperty({ required: false })
  spotifyScopes: string[];

  @ApiProperty({ required: true })
  campaignStarttime?: Date;

  @ApiProperty({ required: true })
  campaignEndtime?: Date;

  // @ApiProperty({ required: false })
  // brackhitId?: number;
  //
  // @ApiProperty({ required: false })
  // ballotId?: number;
  //
  // @ApiProperty({ required: false })
  // triviaId?: string;

  @ApiProperty({ required: false })
  recaptcha?: number;

  @ApiProperty({ required: false })
  spotifyAuth?: 0 | 1;
}
