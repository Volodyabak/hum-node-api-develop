import { Model } from 'objection';

export class VimeoVideoModel extends Model {
  id: number;
  vimeoId: number;
  videoTitle: string;
  description: string;
  thumbnail: string;
  videoCreated: Date;
  dateInserted: Date;

  static get tableName() {
    return 'ean_collection.vimeo_video';
  }

  static get idColumn() {
    return 'id';
  }
}
