import { ApiProperty } from '@nestjs/swagger';

import { CAMPAIGN_TYPE_ID } from '../../constants/campaign.constants';

export class CreateCampaignInput {
  @ApiProperty({ required: true })
  typeId: CAMPAIGN_TYPE_ID;
  @ApiProperty({ required: true })
  name: string;
  @ApiProperty({ required: true })
  publicName: string;
  @ApiProperty({ required: true })
  link: string;
  @ApiProperty({ required: false })
  termLink: string;
  @ApiProperty({ required: false })
  redirectUrl: string;
  @ApiProperty({ required: false })
  userDetailsPlacement: 0 | 1;
  @ApiProperty({ required: false })
  recaptcha: number;
  @ApiProperty({ required: false })
  spotifyScopes: string[];
  @ApiProperty({ required: false })
  spotifyAuth: 0 | 1;
  @ApiProperty({ required: true })
  campaignStarttime: Date;
  @ApiProperty({ required: true })
  campaignEndtime: Date;
}
