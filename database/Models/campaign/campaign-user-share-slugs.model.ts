import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class CampaignUserShareSlugsModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  campaignId: number;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  slug: string;
  @ApiProperty()
  createdAt: Date;

  static get tableName() {
    return 'labl.campaign_user_share_slugs';
  }

  static get idColumn() {
    return 'id';
  }
}
