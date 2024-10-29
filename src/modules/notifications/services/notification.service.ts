import { Injectable, Logger } from '@nestjs/common';
import { OneSignalClient } from '../../one-signal/services/one-signal.client';
import {
  BrackhitChallengesModel,
  BrackhitCommentsModel,
  BrackhitRepliesModel,
  UserDevicesModel,
  UserProfileInfoModel,
} from '../../../../database/Models';
import { MessageBuilderService } from './message-builder.service';
import { AppEventName, AppEventPayload } from '../../app-events/app-events.types';
import {
  SendCustomNotificationBodyDto,
  SendTestNotificationBodyDto,
} from '../dto/notification.dto';
import { RecommendedBrackhitDto } from '../../brackhits/dto/brackhits.dto';
import { Utils } from '../../../Tools/utils/utils';
import { ChallengeBrackhitDto } from '../../brackhits/dto/brackhits-challenges.dto';
import { CreateNotificationResponseBody } from '../../one-signal/interfaces/one-signal.interface';
import { expr } from '../../../../database/relations/relation-builder';
import { Relations } from '../../../../database/relations/relations';
import { RepositoryService } from '../../repository/services/repository.service';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly oneSignalClient: OneSignalClient,
    private readonly messageBuilderService: MessageBuilderService,
    private readonly repoService: RepositoryService,
  ) {}

  async sendUserSentFriendRequestNotification(
    userId: string,
    username: string,
    friendId: string,
  ): Promise<CreateNotificationResponseBody> {
    const message = this.messageBuilderService.buildFriendRequestMessage(username);

    return this.sendNotification({
      userIds: [friendId],
      title: 'Artistory',
      message,
      data: {
        link: `artistory://profile/friends`,
      },
    });
  }

  async sendUserAcceptedFriendRequestNotification(
    username: string,
    friendId: string,
  ): Promise<any> {
    const message = this.messageBuilderService.buildAcceptedFriendRequestMessage(username);

    return this.sendNotification({
      userIds: [friendId],
      title: 'Artistory',
      message,
      data: {
        link: 'artistory://friends/user/${friendId}',
      },
    });
  }

  async sendNewBrackhitNotification(
    brackhitId: number,
    creatorUsername: string,
    friendUserId: string,
    friendUsername: string,
  ): Promise<CreateNotificationResponseBody> {
    if (creatorUsername && friendUsername) {
      return this.sendNotification({
        userIds: [friendUserId],
        title: 'Artistory BrackHits',
        message: `${creatorUsername} just made a new brackhit! Tap to play`,
        data: {
          link: `artistory://games/${brackhitId}/preview`,
        },
      });
    }
  }

  async sendSuggestNewBrackhitNotification(
    userIds: string[],
    brackhitId: number,
    brackhitName: string,
    artistName: string,
  ): Promise<CreateNotificationResponseBody> {
    return this.sendNotification({
      userIds,
      title: 'New BrackHit Alert',
      message: `Check out the "${brackhitName}" brackhit featuring ${artistName}`,
      data: {
        link: `artistory://games/${brackhitId}/preview`,
      },
    });
  }

  async sendSuggestBrackhitNotification(brackhitId: number, userId: string): Promise<any> {
    return this.sendNotification({
      userIds: [userId],
      title: 'Artistory BrackHits',
      message: 'Your artists are featured in new brackhits! Check them out',
      data: {
        link: `artistory://games/${brackhitId}/preview`,
      },
    });
  }

  async sendRecommendedBrackhitNotification(userId: string, brackhit: RecommendedBrackhitDto) {
    return this.sendNotification({
      userIds: [userId],
      title: '⚠ Brackhit Alert ⚠',
      message: `Check out the "${brackhit.brackhitName}" brackhit featuring ${brackhit.artistName}`,
      data: {
        link: `artistory://games/${brackhit.brackhitId}/preview`,
      },
    });
  }

  async sendRecommendedBrackhitForNewUserNotification(
    userId: string,
    brackhitId: number,
    brackhitName: string,
    artistName: string,
  ) {
    return this.sendNotification({
      userIds: [userId],
      title: 'BrackHit Alert!',
      message: `We think you’ll like the "${brackhitName}" brackhit featuring ${artistName}`,
      data: {
        link: `artistory://brackhit/${brackhitId}`,
      },
    });
  }

  async sendBrackhitCommentNotification(payload: AppEventPayload[AppEventName.COMMENT_BRACKHIT]) {
    return this.sendNotification({
      userIds: [payload.ownerId],
      title: 'New Comment on your BrackHit',
      message: `${payload.username} just commented on your ${payload.brackhitName} brackhit`,
      data: {
        link: `artistory://brackhit/${payload.brackhitId}/comments`,
      },
    });
  }

  async sendBrackhitCommentReplyNotification(
    payload: AppEventPayload[AppEventName.REPLY_BRACKHIT_COMMENT],
  ) {
    return this.sendNotification({
      userIds: [payload.ownerId],
      title: 'Artistory BrackHits',
      message: `${payload.username} has replied to your comment`,
      data: {
        link: `artistory://brackhit/${payload.brackhitId}`,
      },
    });
  }

  async sendBrackhitCommentLikeNotification(
    comment: BrackhitCommentsModel | BrackhitRepliesModel,
  ): Promise<CreateNotificationResponseBody> {
    const message = this.messageBuilderService.buildBrackhitCommentLikeMessage(
      comment.brackhit.name,
      comment.totalLikes,
    );

    return this.sendNotification({
      userIds: [comment.userId],
      title: 'Artistory BrackHits',
      message,
      data: {
        link: `artistory://brackhit/${comment.brackhit.brackhitId}/comments`,
      },
    });
  }

  async sendBrackhitResultsNotification(data: {
    userIds: string[];
    brackhitId: number;
    brackhitName: string;
  }): Promise<CreateNotificationResponseBody> {
    return this.sendNotification({
      userIds: data.userIds,
      title: 'Brackhit Results',
      message: `The ${data.brackhitName} brackhit summary is ready! 👀`,
      data: {
        link: `artistory://games/${data.brackhitId}/preview`,
      },
    });
  }

  async sendUserCompletedBrackhitNotification(data: {
    friendIds: string[];
    username: string;
    brackhitId: number;
    brackhitName: string;
  }) {
    return Promise.all(
      data.friendIds.map((friendId) => {
        try {
          this.sendNotification({
            userIds: [friendId],
            title: 'Artistory BrackHits',
            message: `${data.username} just finished the ${data.brackhitName} brackhit. Tap to see their choices!`,
            data: {
              link: `artistory://games/${data.brackhitId}/preview`,
            },
          });
        } catch (err) {
          this.logger.error(err);
        }
      }),
    );
  }

  async sendBrackhitCreatorCompletionsNotification(
    data: AppEventPayload[AppEventName.BRACKHIT_CREATOR_COMPLETIONS_NOTIFICATION],
  ): Promise<CreateNotificationResponseBody> {
    return this.sendNotification({
      userIds: [data.userId],
      title: 'BrackHits',
      message: `${data.completionCount} users have completed your ${data.brackhitName} brackhit! Tap to see how they filled it out 🤔`,
      data: {
        link: `artistory://games/${data.brackhitId}/preview`,
      },
    });
  }

  async sendBrackhitChallengeNotification(
    challenge: BrackhitChallengesModel,
    brackhit: ChallengeBrackhitDto,
  ): Promise<CreateNotificationResponseBody> {
    const rank = Utils.getNumberWithOrdinal(brackhit.rank);

    return this.sendNotification({
      userIds: [brackhit.owner.userId],
      title: 'Brackhit Challenges',
      message: `You're currently ${rank} on the ${challenge.challengeName}! Share your brackhit to keep it up!`,
      data: {
        link: `artistory://games/${brackhit.brackhitId}/preview`,
      },
    });
  }

  async sendBrackhitChallengeWinnerNotification(
    challenge: BrackhitChallengesModel,
    brackhit: ChallengeBrackhitDto,
  ): Promise<CreateNotificationResponseBody> {
    return this.sendNotification({
      userIds: [brackhit.owner.userId],
      title: "You've won",
      message: `Your Brackhit has won the ${challenge.challengeName}! Look out for an email from us to claim your prize!`,
      data: {
        link: `artistory://games/${brackhit.brackhitId}/preview`,
      },
    });
  }

  async sendNewReleasesNotification(
    userId: string,
    artistNames: string[],
  ): Promise<CreateNotificationResponseBody> {
    const message = this.messageBuilderService.buildNewReleasesMessage(artistNames);

    return this.sendNotification({
      userIds: [userId],
      title: 'New Releases',
      message,
      data: {
        link: 'artistory://feed',
      },
    });
  }

  // use only for testing
  async sendTestNotification(body: SendTestNotificationBodyDto): Promise<any> {
    return this.sendNotification({ ...body });
  }

  async sendCustomNotification(
    userId: string,
    body: Omit<SendCustomNotificationBodyDto, 'userIds'>,
  ): Promise<any> {
    return this.sendNotification({
      userIds: [userId],
      title: body.title,
      message: body.message,
      image: body.image,
      data: {
        link: body.link,
      },
    });
  }

  private async sendNotification(data: {
    userIds: string[];
    title: string;
    message?: string;
    data?: Record<string, unknown>;
    image?: string;
  }): Promise<CreateNotificationResponseBody> {
    const devices = await UserDevicesModel.query().whereIn('userId', data.userIds);
    const oneSignalIds = devices.filter((el) => el.pushEnabled).map((el) => el.oneSignalId);

    if (oneSignalIds.length) {
      this.logger.log(
        `Sending notification: ${JSON.stringify({
          title: data.title,
          message: data.message,
          data: data.data,
          oneSignalIds,
        })}`,
      );

      return this.oneSignalClient.sendNotification({
        include_player_ids: oneSignalIds,
        headings: { en: data.title },
        contents: { en: data.message },
        data: data.data,
        big_picture: data.image, // to display image on android devices
        ios_attachments: {
          id: data.image + '?filetype=file.webp', // to display image on ios devices
        },
      });
    }
  }

  // async sendBrackhitContainingUserArtistsNotification(
  //   brackhitId: number,
  //   userId: string,
  // ) {
  //   const userArtists = await UserService.getUserArtists(userId);
  //   const result = await BrackhitsServiceExpress.isTrackBrackhitContainsArtists(
  //     brackhitId,
  //     userArtists.artistIds,
  //     4,
  //   );
  //
  //   if (result.contains) {
  //     const devices = await UserService.getUserDevices(userId);
  //     const oneSignalIds = devices.filter((el) => el.pushEnabled).map((el) => el.oneSignalId);
  //
  //     if (oneSignalIds.length) {
  //       const message = this.messageBuilderService.buildBrackhitUserArtistsMessage(result.artists);
  //
  //       return OneSignalService.sendNotification(oneSignalIds, 'New BrackHit Out', message, {
  //         link: `artistory://games/${brackhitId}/preview`,
  //       });
  //     }
  //   }
  // }

  // async sendSuggestBrackhitNotification(brackhitId: number, userId: string): Promise<void> {
  //   const devices = await UserService.getUserDevices(userId);
  //   const oneSignalIds = devices.filter((el) => el.pushEnabled).map((el) => el.oneSignalId);
  //
  //   return OneSignalService.sendNotification(
  //     oneSignalIds,
  //     'Artistory BrackHits',
  //     'Your artists are featured in new brackhits! Check them out',
  //     {
  //       link: `artistory://games/${brackhitId}/preview`,
  //     },
  //   );
  // }
  async sendFirstCreateBrackhitNotification(userId: string) {
    return this.sendNotification({
      userIds: [userId],
      title: 'Create a BrackHit!',
      message: 'What are you putting in your first song bracket?',
      data: {
        link: 'artistory://games/createbrackhit',
      },
    });
  }

  async sendSecondCreateBrackhitNotification(userId: string) {
    return this.sendNotification({
      userIds: [userId],
      title: 'Create a BrackHit!',
      message: 'We all have a song bracket in all of us, time to make yours!',
      data: {
        link: 'artistory://games/createbrackhit',
      },
    });
  }

  async sendOnePendingRequestRemainderNotification(
    userRequestedId: string,
    friendProfile: UserProfileInfoModel,
  ) {
    return this.sendNotification({
      userIds: [userRequestedId],
      title: 'Artistory',
      message: `You have a pending friend request from ${friendProfile.username}. Accept to view their full music profile.`,
      data: {
        link: `artistory://friends/user/${friendProfile.userId}`,
      },
    });
  }

  async sendMultiplePendingRequestRemainderNotification(
    userRequestedId: string,
    totalRequests: number,
  ) {
    return this.sendNotification({
      userIds: [userRequestedId],
      title: 'Artistory',
      message: `You have ${totalRequests} friend requests. Accept to view their full music profiles.`,
    });
  }

  async sendPendingRequestsReminderNotification(userId: string) {
    const requests = await this.repoService.friendRepo
      .getUserPendingFriendRequests(userId)
      .withGraphFetched(expr([Relations.UserProfile]));

    let body: CreateNotificationResponseBody;

    if (requests.length === 1) {
      body = await this.sendOnePendingRequestRemainderNotification(userId, requests[0].userProfile);
    } else if (requests.length > 1) {
      body = await this.sendMultiplePendingRequestRemainderNotification(userId, requests.length);
    }

    const message = this.messageBuilderService.buildPendingRequestResultMessage(
      body,
      userId,
      requests.length,
    );

    return {
      message,
      ...body,
    };
  }

  async getUsersDevices(userIds: string[]): Promise<UserDevicesModel[]> {
    return UserDevicesModel.query().whereIn('userId', userIds);
  }
}
