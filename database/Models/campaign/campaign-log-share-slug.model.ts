import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class CampaignLogShareSlugModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  userId: string;
  @ApiProperty()
  campaignId: number;
  @ApiProperty()
  shareSlugId: number;
  @ApiProperty()
  createdAt: Date;

  static get tableName() {
    return 'labl.campaign_log_share_slug';
  }

  static get idColumn() {
    return 'id';
  }
}
