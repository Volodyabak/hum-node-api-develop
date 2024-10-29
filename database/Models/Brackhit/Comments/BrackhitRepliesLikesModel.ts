import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../../src/api-model-examples';
import { BrackhitCommentsModel } from './BrackhitCommentsModel';
import { UserProfileInfoModel } from '../../User/UserProfileInfoModel';

export class BrackhitRepliesLikesModel extends Model {
  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty()
  commentId: number;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  createdAt: Date;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  updatedAt: Date;

  comment?: BrackhitCommentsModel;
  userProfile?: UserProfileInfoModel;

  static get tableName() {
    return 'labl.brackhit_replies_likes';
  }

  static get idColumn() {
    return ['userId', 'commentId'];
  }

  static get relationMappings() {
    return {
      comment: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitCommentsModel,
        join: {
          from: 'labl.brackhit_replies_likes.commentId',
          to: 'labl.brackhit_comments.id',
        },
      },

      userProfile: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.brackhit_replies_likes.userId',
          to: 'labl.user_profile_info.userId',
        },
      },
    };
  }
}
