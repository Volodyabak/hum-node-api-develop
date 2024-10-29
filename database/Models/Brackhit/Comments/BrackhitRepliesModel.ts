import { Model } from 'objection';
import { BrackhitCommentsModel } from './BrackhitCommentsModel';
import { ApiProperty } from '@nestjs/swagger';
import { UserProfileInfoModel } from '../../User';
import { BrackhitRepliesFlagsModel } from './BrackhitRepliesFlagsModel';
import { BrackhitCommentsFlagsModel } from './BrackhitCommentsFlagsModel';
import { Relations } from '../../../relations/relations';
import { BrackhitModel } from '../../BrackhitModel';
import { BrackhitRepliesLikesModel } from './BrackhitRepliesLikesModel';

export class BrackhitRepliesModel extends Model {
  @ApiProperty()
  replyId: number;

  @ApiProperty()
  commentId: number;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  text: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  totalLikes: number;
  comment?: BrackhitCommentsModel;
  userProfile?: UserProfileInfoModel;
  flags?: BrackhitRepliesFlagsModel[];
  brackhit?: BrackhitModel;

  static get tableName() {
    return 'labl.brackhit_replies';
  }

  static get idColumn() {
    return 'replyId';
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.HasOneThroughRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_replies.commentId',
          through: {
            modelClass: BrackhitCommentsModel,
            from: 'labl.brackhit_comments.id',
            to: 'labl.brackhit_comments.brackhitId',
          },
          to: 'labl.brackhit.brackhitId',
        },
      },

      [Relations.Comment]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitCommentsModel,
        join: {
          from: 'labl.brackhit_replies.commentId',
          to: 'labl.brackhit_comments.id',
        },
      },

      [Relations.Likes]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitRepliesLikesModel,
        join: {
          from: 'labl.brackhit_replies.replyId',
          to: 'labl.brackhit_replies_likes.commentId',
        },
      },

      flags: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitCommentsFlagsModel,
        join: {
          from: 'labl.brackhit_replies.replyId',
          to: 'labl.brackhit_comments_flags.commentId',
        },
      },

      userProfile: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.brackhit_replies.userId',
          to: 'labl.user_profile_info.userId',
        },
      },
    };
  }
}
