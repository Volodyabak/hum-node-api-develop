import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { CampaignLogsModel } from './campaign-logs.model';

export class CampaignLogActionModel extends Model {
  id: number;
  actionName: string;

  static get tableName() {
    return 'labl.campaign_log_actions';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Logs]: {
        relation: Model.HasManyRelation,
        modelClass: CampaignLogsModel,
        join: {
          from: `${CampaignLogActionModel.tableName}.id`,
          to: `${CampaignLogsModel.tableName}.actionId`,
        },
      },
    };
  }
}
