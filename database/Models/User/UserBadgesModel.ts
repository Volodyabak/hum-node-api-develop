import { Model } from 'objection';
import { BadgesModel } from './BadgesModel';
import { UserBadgeSection } from '../../../src/modules/friends/constants';
import { UserBadgesCheckedModel } from "./UserBadgesCheckedModel";

export class UserBadgesModel extends Model {
  badgeId: number;
  badge: string;
  userId: string;
  friendId: string;
  section: UserBadgeSection;

  static get tableName() {
    return 'labl.user_badges';
  }

  static get idColumn() {
    return ['userId', 'badgeId'];
  }

  static get relationMappings() {
    return {
      badges: {
        relation: Model.HasOneRelation,
        modelClass: BadgesModel,
        join: {
          from: 'labl.user_badges.badgeId',
          to: 'labl.badges.id',
        },
      },

      userBadgesChecked: {
        relation: Model.HasManyRelation,
        modelClass: UserBadgesCheckedModel,
        join: {
          from: 'labl.user_badges.userId',
          to: 'labl.user_badges_checked.userId',
        },
      },
    };
  }
}
