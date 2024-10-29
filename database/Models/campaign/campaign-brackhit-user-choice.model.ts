import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { BrackhitContentModel } from '../Brackhit/BrackhitContentModel';
import { ApiProperty } from '@nestjs/swagger';

export class CampaignBrackhitUserChoiceModel extends Model {
  @ApiProperty()
  id: number;
  @ApiProperty()
  campaignUserBrackhitId: number;
  @ApiProperty()
  roundId: number;
  @ApiProperty()
  choiceId: number;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;

  brackhitContent: BrackhitContentModel;

  static get tableName() {
    return 'labl.campaign_brackhit_user_choice';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.BrackhitContent]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitContentModel,
        join: {
          from: 'labl.campaign_brackhit_user_choice.choiceId',
          to: 'labl.brackhit_content.choiceId',
        },
      },
    };
  }
}
