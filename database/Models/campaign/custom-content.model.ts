import { Model } from 'objection';

export class CustomContentModel extends Model {
  id: number;
  name: string;
  thumbnail: string;
  contentUrl: string;
  sourceTypeId: number;
  createdAt: Date;
  updatedAt: Date;

  static get tableName() {
    return 'ean_collection.custom_content';
  }

  static get idColumn() {
    return 'id';
  }
}
