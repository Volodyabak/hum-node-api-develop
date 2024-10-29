import { Model } from 'objection';

export class BrackhitHomeModel extends Model {
  id: number;
  name: string;
  categoryIds: string;

  static get tableName() {
    return 'labl.brackhit_home';
  }

  static get idColumn() {
    return 'id';
  }
}
