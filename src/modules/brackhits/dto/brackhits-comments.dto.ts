import { IsInt, IsNotEmpty, IsOptional, IsPositive, MaxLength, Min } from 'class-validator';

import {
  BRACKHIT_COMMENT_MAX_LENGTH,
  BRACKHIT_COMMENT_REPLIES_COUNT,
  BRACKHIT_COMMENTS_COUNT,
} from '../constants/brackhits.constants';
import {
  COMMENT_TEXT,
  FIRST_NAME,
  LAST_NAME,
  TIMESTAMP_EXAMPLE,
  USERNAME,
  UUID_V4,
} from '../../../api-model-examples';
import { ApiProperty } from '@nestjs/swagger';

export class BrackhitCommentsListQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ required: false, default: BRACKHIT_COMMENTS_COUNT })
  @IsOptional()
  @Min(0)
  take: number = BRACKHIT_COMMENTS_COUNT;
}

export class BrackhitCommentRepliesQueryDto {
  @ApiProperty({ required: false, default: 0 })
  @IsOptional()
  @Min(0)
  skip: number = 0;

  @ApiProperty({ required: false, default: BRACKHIT_COMMENT_REPLIES_COUNT })
  @IsOptional()
  @Min(0)
  take: number = BRACKHIT_COMMENT_REPLIES_COUNT;
}

export class BrackhitCommentParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  commentId: number;
}

export class BrackhitCommentReplyParamsDto {
  @ApiProperty()
  @IsNotEmpty()
  replyId: number;
}

export class CreateBrackhitCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  brackhitId: number;

  @ApiProperty()
  @IsOptional()
  @IsPositive()
  @IsInt()
  roundId: number = null;

  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(BRACKHIT_COMMENT_MAX_LENGTH, { message: 'Comment is too long' })
  text: string;
}

export class ReplyBrackhitCommentDto {
  @ApiProperty()
  @IsNotEmpty()
  @MaxLength(BRACKHIT_COMMENT_MAX_LENGTH, { message: 'Comment is too long' })
  text: string;
}

export class ReplyBrackhitCommentResponseDto {
  @ApiProperty()
  replyId: number;

  @ApiProperty()
  brackhitId: number;

  @ApiProperty({ example: UUID_V4 })
  commentUserId: string;

  @ApiProperty({ example: USERNAME })
  replyUserName: string;
}

export class BrackhitCommentReplyMeta {
  @ApiProperty()
  commentId: number;

  @ApiProperty({ example: COMMENT_TEXT })
  text: string;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  createdAt: Date;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: USERNAME })
  username: string;

  @ApiProperty({ example: FIRST_NAME })
  firstName: string;

  @ApiProperty({ example: LAST_NAME })
  lastName: string;

  @ApiProperty()
  userImage: string;

  @ApiProperty()
  influencerType: number;

  @ApiProperty()
  isOwner: 0 | 1;

  @ApiProperty()
  liked: boolean;

  @ApiProperty()
  reported: boolean;

  @ApiProperty()
  likes: number;
}

export class BrackhitCommentMetaDto {
  @ApiProperty()
  commentId: number;

  @ApiProperty()
  roundId: number;

  @ApiProperty({ example: COMMENT_TEXT })
  text: string;

  @ApiProperty({ example: TIMESTAMP_EXAMPLE })
  createdAt: Date;

  @ApiProperty({ example: UUID_V4 })
  userId: string;

  @ApiProperty({ example: USERNAME })
  username: string;

  @ApiProperty({ example: FIRST_NAME })
  firstName: string;

  @ApiProperty({ example: LAST_NAME })
  lastName: string;

  @ApiProperty()
  userImage: string;

  @ApiProperty()
  influencerType: number;

  @ApiProperty()
  isOwner: 0 | 1;

  @ApiProperty()
  liked: boolean;

  @ApiProperty()
  reported: boolean;

  @ApiProperty()
  totalLikes: number;

  @ApiProperty()
  totalReplies: number;

  @ApiProperty({ type: [BrackhitCommentReplyMeta] })
  replies: BrackhitCommentReplyMeta[];
}

export class GetBrackhitCommentsResponseDto {
  @ApiProperty()
  brackhitId: number;

  @ApiProperty()
  skip: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [BrackhitCommentMetaDto] })
  comments: BrackhitCommentMetaDto[];
}

export class GetBrackhitCommentRepliesResponseDto {
  @ApiProperty()
  commentId: number;

  @ApiProperty()
  skip: number;

  @ApiProperty()
  take: number;

  @ApiProperty()
  total: number;

  @ApiProperty({ type: [BrackhitCommentReplyMeta] })
  replies: BrackhitCommentReplyMeta[];
}
