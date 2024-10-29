import { Model } from 'objection';

export class FeedSourceModel extends Model {
  id: number;
  feedName: string;
  idColumn: string;
  feedType: number;

  static get tableName() {
    return 'ean_collection.feed_source';
  }

  static get idColumn() {
    return 'id';
  }

  static getTableNameWithAlias(alias: string = 'fs'): string {
    return FeedSourceModel.tableName.concat(' as ', alias);
  }
}
