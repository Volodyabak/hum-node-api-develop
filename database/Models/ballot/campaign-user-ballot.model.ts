import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { CampaignBallotUserChoice } from '@database/Models';

export class CampaignUserBallotModel extends Model {
  id: number;
  campaignId: number;
  campaignUserId: string;
  campaignBallotId: number;
  createdAt: Date;
  updatedAt: Date;

  campaignUserBallotChoices?: CampaignBallotUserChoice[];

  static get tableName() {
    return 'labl.campaign_user_ballot';
  }
  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.CampaignUserBallotChoices]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignBallotUserChoice,
        join: {
          from: `${CampaignUserBallotModel.tableName}.id`,
          to: `${CampaignBallotUserChoice.tableName}.campaignUserBallotId`,
        },
      },
    };
  }
}
