import { Model } from 'objection';
import { YoutubeVideoModel } from '@database/Models';
import { Relations } from '@database/relations/relations';

export class YoutubeClipModel extends Model {
  id: number;
  youtubeVideoId: number;
  youtubeClipId: string;

  video?: YoutubeVideoModel;

  static get tableName() {
    return 'ean_collection.youtube_video_clip';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Video]: {
        relation: Model.BelongsToOneRelation,
        modelClass: YoutubeVideoModel,
        join: {
          from: `${this.tableName}.youtubeVideoId`,
          to: `${YoutubeVideoModel.tableName}.id`,
        },
      },
    };
  }
}
