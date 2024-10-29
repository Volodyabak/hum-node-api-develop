import { Model } from 'objection';

export class BuzzbeatTypeModel extends Model {
  static get tableName() {
    return 'labl.buzzbeat_type';
  }

  static get idColumn() {
    return 'type_id';
  }
}
