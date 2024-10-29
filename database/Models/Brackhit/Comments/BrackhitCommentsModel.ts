import { Model } from 'objection';
import { BrackhitModel } from '../../BrackhitModel';
import { ApiProperty } from '@nestjs/swagger';
import { TIMESTAMP_EXAMPLE, UUID_V4 } from '../../../../src/api-model-examples';
import { UserProfileInfoModel } from '../../User';
import { BrackhitCommentsLikesModel } from './BrackhitCommentsLikesModel';
import { BrackhitRepliesModel } from './BrackhitRepliesModel';
import { Relations } from '../../../relations/relations';

export class BrackhitCommentsModel extends Model {
  @ApiProperty()
  id: number;

  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  roundId: number;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: 'Awesome comment!' })
  text: string;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  createdAt: Date;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  updatedAt: Date;

  totalLikes: number;

  brackhit?: BrackhitModel;
  userProfile?: UserProfileInfoModel;
  likes?: BrackhitCommentsLikesModel[];
  replies?: BrackhitRepliesModel[];

  static get tableName() {
    return 'labl.brackhit_comments';
  }

  static get idColumn() {
    return 'id';
  }

  static get relationMappings() {
    return {
      [Relations.Brackhit]: {
        relation: Model.BelongsToOneRelation,
        modelClass: BrackhitModel,
        join: {
          from: 'labl.brackhit_comments.brackhitId',
          to: 'labl.brackhit.brackhitId',
        },
      },

      userProfile: {
        relation: Model.BelongsToOneRelation,
        modelClass: UserProfileInfoModel,
        join: {
          from: 'labl.brackhit_comments.userId',
          to: 'labl.user_profile_info.userId',
        },
      },

      [Relations.Likes]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitCommentsLikesModel,
        join: {
          from: 'labl.brackhit_comments.id',
          to: 'labl.brackhit_comments_likes.commentId',
        },
      },

      [Relations.Replies]: {
        relation: Model.HasManyRelation,
        modelClass: BrackhitRepliesModel,
        join: {
          from: 'labl.brackhit_comments.id',
          to: 'labl.brackhit_replies.commentId',
        },
      },
    };
  }
}
