import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { CampaignUserModel, CampaignUserBrackhitModel } from '@database/Models';

export class CampaignUserAgentModel extends Model {
  id: number;
  campaignUserId: string;
  ip: string;
  userAgent: string;
  city: string;
  region: string;
  country: string;
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;

  static get tableName() {
    return 'labl.campaign_user_agents';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.User]: {
        relation: Model.HasOneRelation,
        modelClass: CampaignUserModel,
        join: {
          from: `${CampaignUserAgentModel.tableName}.campaignUserId`,
          to: `${CampaignUserModel.tableName}.userId`,
        },
      },

      [Relations.BrackhitUser]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignUserBrackhitModel,
        join: {
          from: `${CampaignUserAgentModel.tableName}.campaignUserId`,
          to: `${CampaignUserBrackhitModel.tableName}.campaignUserId`,
        },
      },
    };
  }
}
