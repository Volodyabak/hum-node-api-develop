import { Model } from 'objection';

export class CentralIsrcModel extends Model {
  id: number;
  isrc: string;

  static get tableName() {
    return 'ean_collection.central_isrc';
  }

  static get idColumn() {
    return 'id';
  }
}
