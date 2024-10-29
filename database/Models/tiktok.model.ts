import { Model } from 'objection';

export class TiktokModel extends Model {
  id: number;
  tiktokId: string;
  title: string;
  author: string;
  thumbnail: string;
  link: string;
  videoCreated: Date;
  dateInserted: Date;

  static get tableName() {
    return 'ean_collection.tiktok_post';
  }

  static get idColumn() {
    return 'id';
  }
}
