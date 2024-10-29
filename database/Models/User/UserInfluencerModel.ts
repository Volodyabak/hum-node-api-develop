import { Model } from 'objection';

export class UserInfluencerModel extends Model {
  userId: string;
  typeId: number;
  timestamp: Date;

  static get tableName() {
    return 'labl.user_influencer';
  }

  static get idColumn() {
    return 'userId';
  }

  static get relationMappings() {
    return {};
  }
}
