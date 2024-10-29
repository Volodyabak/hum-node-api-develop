import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';

export class CampaignSlugModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  campaignId: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  slug: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  static get tableName() {
    return 'labl.campaign_slug';
  }

  static get idColumn() {
    return 'id';
  }
}
