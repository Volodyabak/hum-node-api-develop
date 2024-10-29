import { Model } from 'objection';
import { UserProfileInfoModel } from '../User';

export class UserFriendsModel extends Model {
  userId: string;
  friendId: string;
  timestamp: string;

  friendProfile?: UserProfileInfoModel;

  static get tableName() {
    return 'labl.user_friends';
  }

  static get idColumn() {
    return ['userId', 'friendId'];
  }

  static getTableNameWithAlias(alias: string): string {
    return UserFriendsModel.tableName.concat(' as ', alias);
  }

  static get relationMappings() {
    return {
      friendProfile: {
        relation: Model.HasOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.user_friends.friendId',
          to: 'labl.user_profile_info.userId',
        },
      },
    };
  }

  static get callbacks() {
    return {};
  }
}
