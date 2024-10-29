import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../src/api-model-examples';
import { FriendRequestStatus } from '../../../src/modules/friends/constants';
import { Relations } from '../../relations/relations';
import { UserProfileInfoModel } from '../User';

export class UserFriendRequestsModel extends Model {
  @ApiProperty({ example: UUID_V4 })
  userId: string;
  @ApiProperty({ example: UUID_V4 })
  userRequestedId: string;
  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  timestamp: Date;
  @ApiProperty({ example: FriendRequestStatus.ACCEPTED })
  status: FriendRequestStatus;
  oneSignalId: string;

  total?: number;
  userProfile?: UserProfileInfoModel;
  userRequestedProfile?: UserProfileInfoModel;

  static get tableName() {
    return 'labl.user_friend_requests';
  }

  static get idColumn() {
    return ['userId', 'userRequestedId', 'timestamp'];
  }

  static get relationMappings() {
    return {
      [Relations.UserProfile]: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.user_friend_requests.userId',
          to: 'labl.user_profile_info.userId',
        },
      },
      [Relations.UserRequestedProfile]: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.user_friend_requests.userRequestedId',
          to: 'labl.user_profile_info.userId',
        },
      },
    };
  }

  static get rawSql() {
    return {
      // status order: friend, respond, requested, none, self
      getUserFriendStatusOrderNumber(userId: string): string {
        return `
        if (upi.user_id = \'${userId}\', 5,
        if (in.status = \'${FriendRequestStatus.ACCEPTED}\' or out.status = \'${FriendRequestStatus.ACCEPTED}\', 1,
        if (in.status = \'${FriendRequestStatus.PENDING}\', 2,
        if (out.status = \'${FriendRequestStatus.PENDING}\', 3,  4)))) as relationshipOrder
        `;
      },
    };
  }
}
