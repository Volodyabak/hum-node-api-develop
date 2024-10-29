import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { CampaignBrackhitUserChoiceModel, CampaignModel } from '@database/Models';
import { ApiProperty } from '@nestjs/swagger';

export class CampaignUserBrackhitModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  campaignUserId: string;
  @ApiProperty()
  campaignId: number;
  @ApiProperty()
  campaignBrackhitId: number;
  @ApiProperty()
  completions: number;
  @ApiProperty()
  score: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  totalCompletions?: number;
  campaignBrackhitUserChoice?: CampaignBrackhitUserChoiceModel[];
  campaign?: CampaignModel;

  static get tableName() {
    return 'labl.campaign_user_brackhit';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.BrackhitContent]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignBrackhitUserChoiceModel,
        join: {
          from: 'labl.campaign_user_brackhit.id',
          to: 'labl.campaign_brackhit_user_choice.campaignUserBrackhitId',
        },
      },

      [Relations.Campaign]: {
        relation: Model.BelongsToOneRelation,
        modelClass: CampaignModel,
        join: {
          from: `${CampaignUserBrackhitModel.tableName}.campaignId`,
          to: `${CampaignModel.tableName}.id`,
        },
      },
    };
  }
}
