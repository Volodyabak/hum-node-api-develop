import { Model } from 'objection';

export class UserBadgesCheckedModel extends Model {
  userId: string;
  lastChecked: Date;

  static get tableName() {
    return 'labl.user_badges_checked';
  }

  static get idColumn() {
    return 'userId';
  }

  static get relationMappings() {
    return {};
  }
}
