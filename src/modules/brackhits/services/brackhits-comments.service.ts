import { Injectable } from '@nestjs/common';

import { ErrorConst } from '../../../constants';
import { BadRequestError, NotFoundError } from '../../../Errors';
import { AppEventName } from '../../app-events/app-events.types';
import {
  BrackhitCommentsFlagsModel,
  BrackhitCommentsLikesModel,
  BrackhitCommentsModel,
  BrackhitRepliesFlagsModel,
  BrackhitRepliesLikesModel,
  BrackhitRepliesModel,
} from '../../../../database/Models';
import {
  BrackhitCommentMetaDto,
  BrackhitCommentRepliesQueryDto,
  BrackhitCommentReplyMeta,
  BrackhitCommentsListQueryDto,
  CreateBrackhitCommentDto,
  GetBrackhitCommentRepliesResponseDto,
  GetBrackhitCommentsResponseDto,
  ReplyBrackhitCommentDto,
} from '../dto/brackhits-comments.dto';
import { AppEventsEmitter } from '../../app-events/app-events.emitter';
import { BrackhitsService } from './brackhits.service';
import { BRACKHIT_COMMENT_REPLIES_PREVIEW_COUNT } from '../constants/brackhits.constants';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { BrackhitCommentTypes } from '../constants/brackhits-comments.constants';
import { RepositoryService } from '../../repository/services/repository.service';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { Relations } from '../../../../database/relations/relations';
import { expr } from '../../../../database/relations/relation-builder';
import { JoinOperation } from '../../../Tools/dto/util-classes';

@Injectable()
export class BrackhitsCommentsService {
  constructor(
    private readonly brackhitsService: BrackhitsService,
    private readonly repoService: RepositoryService,
    private readonly eventsEmitter: AppEventsEmitter,
  ) {}

  async findComment(commentId: number): Promise<BrackhitCommentsModel> {
    const comment = await BrackhitCommentsModel.query()
      .findById(commentId)
      .withGraphFetched('[brackhit]');

    if (!comment) {
      throw new NotFoundError(ErrorConst.COMMENT_NOT_FOUND);
    }

    return comment;
  }

  async createComment(
    userId: string,
    body: CreateBrackhitCommentDto,
  ): Promise<BrackhitCommentsModel> {
    const comment = await BrackhitCommentsModel.query()
      .insertAndFetch({
        ...body,
        userId,
      })
      .withGraphFetched('[brackhit, userProfile]');

    this.eventsEmitter.emit(AppEventName.COMMENT_BRACKHIT, {
      userId,
      brackhitId: comment.brackhitId,
      brackhitName: comment.brackhit.name,
      ownerId: comment.brackhit.ownerId,
      username: comment.userProfile.username,
    });

    return comment;
  }

  async deleteComment(userId: string, commentId: number): Promise<BrackhitCommentsModel> {
    const comment = await this.findComment(commentId);

    if (comment.userId !== userId) {
      throw new BadRequestError(ErrorConst.COMMENT_DOES_NOT_BELONG_USER);
    }

    await BrackhitCommentsModel.query().deleteById(commentId);

    return comment;
  }

  async replyComment(
    userId: string,
    commentId: number,
    body: ReplyBrackhitCommentDto,
  ): Promise<BrackhitRepliesModel> {
    await this.findComment(commentId);

    const reply = await BrackhitRepliesModel.query()
      .insertAndFetch({ ...body, userId, commentId })
      .withGraphFetched('[comment, userProfile]');

    this.eventsEmitter.emit(AppEventName.REPLY_BRACKHIT_COMMENT, {
      userId,
      commentId,
      brackhitId: reply.comment?.brackhitId,
      ownerId: reply?.comment?.userId,
      username: reply?.userProfile?.username,
    });

    return reply;
  }

  async deleteReply(userId: string, replyId: number): Promise<BrackhitRepliesModel> {
    const reply = await BrackhitRepliesModel.query().findById(replyId);

    if (!reply) {
      throw new NotFoundError(ErrorConst.COMMENT_REPLY_NOT_FOUND);
    }

    if (reply.userId !== userId) {
      throw new BadRequestError(ErrorConst.COMMENT_REPLY_DOES_NOT_BELONG_USER);
    }

    await BrackhitRepliesModel.query().deleteById(replyId);

    return reply;
  }

  async likeComment(userId: string, commentId: number): Promise<BrackhitCommentsLikesModel> {
    const like = await BrackhitCommentsLikesModel.query().findById([userId, commentId]);

    if (like) {
      throw new BadRequestError(ErrorConst.COMMENT_LIKE_ALREADY_EXIST);
    }

    const insertedLike = await BrackhitCommentsLikesModel.query().insertAndFetch({
      userId,
      commentId,
    });

    this.eventsEmitter.emit(AppEventName.BRACKHIT_COMMENT_LIKE, {
      commentId,
      type: BrackhitCommentTypes.Comment,
    });

    return insertedLike;
  }

  async deleteCommentLike(userId: string, commentId: number): Promise<BrackhitCommentsLikesModel> {
    const like = await BrackhitCommentsLikesModel.query().findById([userId, commentId]);

    if (!like) {
      throw new NotFoundError(ErrorConst.COMMENT_LIKE_NOT_FOUND);
    }

    await BrackhitCommentsLikesModel.query().deleteById([userId, commentId]);

    return like;
  }

  async likeCommentReply(userId: string, commentId: number): Promise<BrackhitRepliesLikesModel> {
    const like = await BrackhitRepliesLikesModel.query().findById([userId, commentId]);

    if (like) {
      throw new BadRequestError(ErrorConst.REPLY_LIKE_ALREADY_EXIST);
    }

    const insertedLike = await BrackhitRepliesLikesModel.query().insertAndFetch({
      userId,
      commentId,
    });

    this.eventsEmitter.emit(AppEventName.BRACKHIT_COMMENT_LIKE, {
      commentId,
      type: BrackhitCommentTypes.Reply,
    });

    return insertedLike;
  }

  async deleteCommentReplyLike(
    userId: string,
    commentId: number,
  ): Promise<BrackhitRepliesLikesModel> {
    const like = await BrackhitRepliesLikesModel.query().findById([userId, commentId]);

    if (!like) {
      throw new NotFoundError(ErrorConst.REPLY_LIKE_NOT_FOUND);
    }

    await BrackhitRepliesLikesModel.query().deleteById([userId, commentId]);

    return like;
  }

  async flagComment(userId: string, commentId: number): Promise<BrackhitCommentsFlagsModel> {
    const flag = await BrackhitCommentsFlagsModel.query().findById([userId, commentId]);

    if (flag) {
      throw new BadRequestError(ErrorConst.COMMENT_FLAG_ALREADY_EXIST);
    }

    return BrackhitCommentsFlagsModel.query().insertAndFetch({ userId, commentId });
  }

  async flagCommentReply(userId: string, commentId: number): Promise<BrackhitRepliesFlagsModel> {
    const flag = await BrackhitRepliesFlagsModel.query().findById([userId, commentId]);

    if (flag) {
      throw new BadRequestError(ErrorConst.REPLY_FLAG_ALREADY_EXIST);
    }

    return BrackhitRepliesFlagsModel.query().insertAndFetch({ userId, commentId });
  }

  async getBrackhitCommentsResponse(
    userId: string,
    brackhitId: number,
    query: BrackhitCommentsListQueryDto,
  ): Promise<GetBrackhitCommentsResponseDto> {
    const brackhit = await this.brackhitsService.getBrackhitById(brackhitId);

    const [comments, total] = await Promise.all([
      this.getBrackhitComments(brackhitId, query),
      BrackhitCommentsModel.query().where({ brackhitId }).resultSize(),
    ]);

    const commentsMeta = await Promise.all(
      comments.map(async (comment) => this.getBrackhitCommentMeta(comment, brackhit, userId)),
    );

    return {
      brackhitId,
      skip: query.skip,
      take: query.take,
      total,
      comments: commentsMeta,
    };
  }

  async getBrackhitCommentRepliesResponse(
    userId: string,
    commentId: number,
    query: BrackhitCommentRepliesQueryDto,
  ): Promise<GetBrackhitCommentRepliesResponseDto> {
    const comment = await this.findComment(commentId);

    const [replies, total] = await Promise.all([
      this.getCommentReplies(comment, query),
      BrackhitRepliesModel.query().where({ commentId: comment.id }).resultSize(),
    ]);

    const repliesMeta = await Promise.all(
      replies.map(async (reply) => this.getBrackhitCommentReplyMeta(reply, comment, userId)),
    );

    return {
      commentId,
      skip: query.skip,
      take: query.take,
      total,
      replies: repliesMeta,
    };
  }

  async getBrackhitComments(
    brackhitId: number,
    query: BrackhitCommentsListQueryDto,
  ): Promise<BrackhitCommentsModel[]> {
    const commentsQB = this.repoService.brackhitCommentRepo.getBrackhitComments(brackhitId);

    QueryBuilderUtils.addPaginationToBuilder(commentsQB, query);
    QueryBuilderUtils.fetchRelationsToBuilder(commentsQB, [
      {
        relation: Relations.UserProfile,
        alias: 'upi',
        select: ['upi.*', 'ui.typeId as influencerType'],
        children: [
          {
            relation: expr([Relations.UserInfluencer, 'ui']),
            join: JoinOperation.leftJoin,
          },
        ],
      },
    ]);

    return commentsQB
      .select('bc.*', 'sub.totalLikes')
      .leftJoin(
        this.repoService.brackhitCommentRepo.getBrackhitCommentLikes(brackhitId).as('sub'),
        'sub.commentId',
        'bc.id',
      )
      .orderBy('sub.totalLikes', 'desc')
      .orderBy('bc.createdAt', 'desc');
  }

  async getBrackhitCommentReplyMeta(
    reply: BrackhitRepliesModel,
    comment: BrackhitCommentsModel,
    userId: string,
  ): Promise<BrackhitCommentReplyMeta> {
    const [likes, liked, reported] = await Promise.all([
      BrackhitRepliesLikesModel.query().where({ commentId: reply.replyId }).resultSize(),
      BrackhitRepliesLikesModel.query().findOne({ commentId: reply.replyId, userId }),
      BrackhitRepliesFlagsModel.query().findOne({ commentId: reply.replyId, userId }),
    ]);

    return {
      commentId: reply.replyId,
      userId: reply.userProfile.userId,
      username: reply.userProfile.username,
      firstName: reply.userProfile.firstName,
      lastName: reply.userProfile.lastName,
      userImage: reply.userProfile.userImage,
      influencerType: reply.userProfile.influencerType,
      isOwner: reply.userId === comment.brackhit.ownerId ? 1 : 0,
      text: reply.text,
      createdAt: reply.createdAt,
      liked: !!liked,
      reported: !!reported,
      likes: likes,
    };
  }

  async getBrackhitCommentMeta(
    comment: BrackhitCommentsModel,
    brackhit: BrackhitModel,
    userId: string,
  ): Promise<BrackhitCommentMetaDto> {
    const [replies, liked, reported] = await Promise.all([
      this.getBrackhitCommentRepliesResponse(userId, comment.id, {
        skip: 0,
        take: BRACKHIT_COMMENT_REPLIES_PREVIEW_COUNT,
      }),
      BrackhitCommentsLikesModel.query().findOne({ commentId: comment.id, userId }),
      BrackhitCommentsFlagsModel.query().findOne({ commentId: comment.id, userId }),
    ]);

    return {
      commentId: comment.id,
      roundId: comment.roundId,
      createdAt: comment.createdAt,
      text: comment.text,
      userId: comment.userProfile.userId,
      username: comment.userProfile.username,
      firstName: comment.userProfile.firstName,
      lastName: comment.userProfile.lastName,
      userImage: comment.userProfile.userImage,
      influencerType: comment.userProfile.influencerType,
      isOwner: comment.userId === brackhit.ownerId ? 1 : 0,
      liked: !!liked,
      reported: !!reported,
      totalLikes: comment.totalLikes || 0,
      totalReplies: replies.total,
      replies: replies.replies,
    };
  }

  async getCommentReplies(comment: BrackhitCommentsModel, query: BrackhitCommentRepliesQueryDto) {
    const repliesQB = this.repoService.brackhitCommentRepo.getCommentReplies(comment);

    QueryBuilderUtils.addPaginationToBuilder(repliesQB, query);
    QueryBuilderUtils.fetchRelationsToBuilder(repliesQB, [
      {
        relation: Relations.UserProfile,
        alias: 'upi',
        select: ['upi.*', 'ui.typeId as influencerType'],
        children: [
          {
            relation: expr([Relations.UserInfluencer, 'ui']),
            join: JoinOperation.leftJoin,
          },
        ],
      },
    ]);

    return repliesQB;
  }
}
