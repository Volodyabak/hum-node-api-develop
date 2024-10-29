import { Injectable } from '@nestjs/common';
import {
  BrackhitCommentsLikesModel,
  BrackhitCommentsModel,
  BrackhitRepliesModel,
} from '../../../../../database/Models';
import { expr } from '../../../../../database/relations/relation-builder';
import { Relations } from '../../../../../database/relations/relations';
import { BrackhitModel } from '../../../../../database/Models/BrackhitModel';
import { raw } from 'objection';
import { BrackhitTotalCommentsParams } from '../../../brackhits/interfaces/brackhit-comments.interfaces';

@Injectable()
export class BrackhitCommentRepository {
  getBrackhitsTotalCommentsAndReplies(columnName: string, params: BrackhitTotalCommentsParams) {
    const comments = this.getBrackhitsTotalComments(columnName, params);
    const replies = this.getBrackhitsTotalReplies(columnName, params);

    return BrackhitModel.query()
      .alias('b')
      .select(
        'b.brackhitId',
        raw(`coalesce(com.${columnName} + rep.${columnName}, 0) as ${columnName}`),
      )
      .leftJoin(comments.as('com'), 'com.brackhitId', 'b.brackhitId')
      .leftJoin(replies.as('rep'), 'rep.brackhitId', 'b.brackhitId');
  }

  getBrackhitsTotalComments(columnName: string, params: BrackhitTotalCommentsParams) {
    const comments = BrackhitCommentsModel.query()
      .alias('bc')
      .select('bc.brackhitId')
      .count(`* as ${columnName}`)
      .groupBy('bc.brackhitId');

    if (params.minDate) {
      comments.where('bc.createdAt', '>=', params.minDate);
    }

    return comments;
  }

  getBrackhitsTotalReplies(columnName: string, params: BrackhitTotalCommentsParams) {
    const replies = BrackhitRepliesModel.query()
      .alias('br')
      .select('bc.brackhitId')
      .count(`* as ${columnName}`)
      .joinRelated(expr([Relations.Comment, 'bc']))
      .groupBy('bc.brackhitId');

    if (params.minDate) {
      replies.where('br.createdAt', '>=', params.minDate);
    }

    return replies;
  }

  getBrackhitComments(brackhitId: number) {
    return BrackhitCommentsModel.query()
      .alias('bc')
      .where('bc.brackhitId', brackhitId)
      .groupBy('bc.id');
  }

  getBrackhitCommentLikes(brackhitId: number) {
    return BrackhitCommentsLikesModel.query()
      .alias('bcl')
      .select('commentId')
      .count('* as totalLikes')
      .joinRelated('comment as bc')
      .groupBy('commentId')
      .where('bc.brackhitId', brackhitId);
  }

  getCommentReplies(comment: BrackhitCommentsModel) {
    return BrackhitRepliesModel.query().alias('br').where('br.commentId', comment.id);
  }

  getCommentsLikes() {
    return BrackhitCommentsModel.query()
      .alias('bc')
      .select('bc.id')
      .count('* as totalLikes')
      .leftJoinRelated(expr([Relations.Likes, 'bcl']))
      .groupBy('bc.id');
  }

  getRepliesLikes() {
    return BrackhitRepliesModel.query()
      .alias('br')
      .select('br.replyId')
      .count('* as totalLikes')
      .leftJoinRelated(expr([Relations.Likes, 'brl']))
      .groupBy('br.replyId');
  }

  getCommentById(commentId: number) {
    return BrackhitCommentsModel.query().alias('bc').where('bc.id', commentId).first();
  }

  getReplyById(replyId: number) {
    return BrackhitRepliesModel.query().alias('br').where('br.replyId', replyId).first();
  }

  getCommentWithLikes(commentId: number) {
    return this.getCommentById(commentId).join(
      this.getCommentsLikes().as('likes'),
      'likes.id',
      'bc.id',
    );
  }

  getReplyWithLikes(replyId: number) {
    return this.getReplyById(replyId).join(
      this.getRepliesLikes().as('likes'),
      'likes.replyId',
      'br.replyId',
    );
  }
}
