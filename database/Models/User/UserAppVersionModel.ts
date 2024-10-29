import { Model } from 'objection';

export class UserAppVersionModel extends Model {
  userId: string;
  appVersion: string;
  timestamp: Date;

  static get tableName() {
    return 'labl.user_app_version';
  }

  static get idColumn() {
    return 'userId';
  }

  static get relationMappings() {
    return {};
  }
}
