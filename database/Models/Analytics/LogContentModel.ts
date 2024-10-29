import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { CentralFeedModel } from '../Artist';
import { InteractionTypes } from '../../../src/modules/analytics/constants';

export class LogContentModel extends Model {
  id: number;
  userId: string;
  centralId: number;
  interactionId: InteractionTypes;
  screenId: number;
  timestamp: Date;
  timeEnd: Date;

  centralFeed?: CentralFeedModel;

  static get tableName() {
    return 'labl.log_content';
  }

  static get idColumn() {
    return ['id'];
  }

  static getTableNameWithAlias(alias: string) {
    return LogContentModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      [Relations.CentralFeed]: {
        relation: Model.BelongsToOneRelation,
        modelClass: CentralFeedModel,
        join: {
          from: 'labl.log_content.centralId',
          to: 'ean_collection.central_feed.id',
        },
      },
    };
  }
}
