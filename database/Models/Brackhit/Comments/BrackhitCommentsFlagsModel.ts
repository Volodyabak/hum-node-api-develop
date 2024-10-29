import { Model } from 'objection';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../../src/api-model-examples';
import { BrackhitCommentsModel } from './BrackhitCommentsModel';
import { UserProfileInfoModel } from '../../User/UserProfileInfoModel';

export class BrackhitCommentsFlagsModel extends Model {
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
    return 'labl.brackhit_comments_flags';
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
          from: 'labl.brackhit_comments_flags.commentId',
          to: 'labl.brackhit_comments.id',
        },
      },

      userProfile: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.brackhit_comments_flags.userId',
          to: 'labl.user_profile_info.userId',
        },
      },
    };
  }
}
