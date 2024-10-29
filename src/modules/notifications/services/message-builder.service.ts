import { Injectable } from '@nestjs/common';
import { BrackhitsCommentsUtils } from '../../brackhits/utils/brackhits-comments.utils';
import { CreateNotificationResponseBody } from '../../one-signal/interfaces/one-signal.interface';

@Injectable()
export class MessageBuilderService {
  buildFriendRequestMessage(username: string): string {
    return `New friend request from ${username}, accept to see their full music profile.`;
  }

  buildAcceptedFriendRequestMessage(username: string): string {
    return `${username} accepted your friend request.`;
  }

  buildBrackhitCommentLikeMessage(brackhitName: string, totalLikes: number): string {
    if (BrackhitsCommentsUtils.isNewCommentLike(totalLikes)) {
      return `Your comment in the "${brackhitName}" brackhit has a new like`;
    } else {
      return `Your comment in the "${brackhitName}" brackhit now has ${totalLikes} likes`;
    }
  }

  buildNewReleasesMessage(artistNames: string[]) {
    let artistNamesStr;

    switch (artistNames.length) {
      case 0:
        return '';
      case 1:
        artistNamesStr = artistNames[0];
        break;
      case 2:
        artistNamesStr = `${artistNames[0]} and ${artistNames[1]}`;
        break;
      case 3:
        artistNamesStr = `${artistNames[0]}, ${artistNames[1]}, ${artistNames[2]}`;
        break;
      default:
        return null;
    }

    return `Artists you follow have new releases including ${artistNamesStr}. Listen now.`;
  }

  buildBrackhitUserArtistsMessage(artistNames: string[]) {
    let artistNamesStr;

    if (artistNames.length === 1) {
      artistNamesStr = artistNames[0];
    } else if (artistNames.length === 2) {
      artistNamesStr = `${artistNames[0]} and ${artistNames[1]}`;
    } else if (artistNames.length >= 3) {
      artistNamesStr = `${artistNames[0]}, ${artistNames[1]}, ${artistNames[2]}`;
    } else {
      return null;
    }

    return `A BrackHit with ${artistNamesStr} is now live`;
  }

  buildPendingRequestMessage(username: string, totalRequests: number) {
    if (totalRequests > 1) {
      return `You have ${totalRequests} friend requests. Accept to view their full music profiles.`;
    } else {
      return `You have a pending friend request from ${username}. Accept to view their full music profile.`;
    }
  }

  buildPendingRequestResultMessage(
    body: CreateNotificationResponseBody,
    userId: string,
    total: number,
  ) {
    if (!body) {
      return `User ${userId} does not have pending notifications`;
    } else if (body.id) {
      return `User ${userId} received ${total} pending request notifications successfully`;
    } else {
      return `User ${userId} pending request notification sending failed`;
    }
  }
}
