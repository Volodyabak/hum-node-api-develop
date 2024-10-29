import {
  BRACKHIT_COMMENT_LIKES_DIVISIBILITY,
  BRACKHIT_COMMENT_NEW_LIKES_COUNT,
} from '../constants/brackhits-comments.constants';

export class BrackhitsCommentsUtils {
  static isNotifiableCommentLike(likes: number): boolean {
    return this.isNewCommentLike(likes) || this.isDivisibleByTenCommentLike(likes);
  }

  static isNewCommentLike(likes: number): boolean {
    return likes <= BRACKHIT_COMMENT_NEW_LIKES_COUNT;
  }

  static isDivisibleByTenCommentLike(likes: number): boolean {
    return likes % BRACKHIT_COMMENT_LIKES_DIVISIBILITY === 0;
  }
}
