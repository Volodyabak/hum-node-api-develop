import { Model } from 'objection';
import { Relations } from '../../relations/relations';
import { YoutubeVideoModel } from './YoutubeVideoModel';

export class YoutubeChannelModel extends Model {
  id: number;
  channelKey: string;
  channelUrl: string;
  channelName: string;
  matchingType: number;
  lastChecked: Date;

  static get tableName() {
    return 'ean_collection.youtube_channel';
  }

  static get idColumn() {
    return ['id', 'channelKey'];
  }

  static get relationMappings() {
    return {
      [Relations.Videos]: {
        relation: Model.HasManyRelation,
        modelClass: YoutubeVideoModel,
        join: {
          from: `${this.tableName}.channelKey`,
          to: `${YoutubeVideoModel.tableName}.channelId`,
        },
      },
    };
  }
}
