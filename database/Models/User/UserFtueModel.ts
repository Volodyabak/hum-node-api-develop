import { Model } from 'objection';

export class UserFtueModel extends Model {
  static get tableName() {
    return 'labl.user_ftue';
  }

  static get idColumn() {
    return 'userId';
  }
}
