import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { Relations } from '@database/relations/relations';
import { BrackhitModel } from '@database/Models/BrackhitModel';

export class CampaignBrackhitModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  campaignId: number;
  @ApiProperty()
  brackhitId: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  brackhit?: BrackhitModel;

  static get tableName() {
    return 'labl.campaign_brackhit';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: `${CampaignBrackhitModel.tableName}.brackhitId`,
          to: `${BrackhitModel.tableName}.${BrackhitModel.idColumn}`,
        },
      },
    };
  }
}
