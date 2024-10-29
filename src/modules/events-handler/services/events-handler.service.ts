import { Injectable } from '@nestjs/common';
import { NotificationService } from '../../notifications/services/notification.service';
import { BrackhitsCalculationService } from '../../brackhits/services/brackhits-calculation.service';
import { ConversionApiService } from '../../facebook/services/conversion-api.service';
import { AppEventName, AppEventPayload } from '../../app-events/app-events.types';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { BrackhitUserModel } from '../../../../database/Models/BrackhitUserModel';
import {
  BrackhitContentType,
  BrackhitScoringState,
} from '../../brackhits/constants/brackhits.constants';
import {
  ArtistModel,
  AWSUsersModel,
  BrackhitCommentsModel,
  BrackhitRepliesModel,
  UserFriendsModel,
  UserProfileInfoModel,
} from '../../../../database/Models';
import { expr } from '../../../../database/relations/relation-builder';
import { Relations } from '../../../../database/relations/relations';
import { FacebookEventName } from '../../facebook/interfaces/conversion-api.intefraces';
import { QueryBuilder } from 'objection';
import { BrackhitCommentTypes } from '../../brackhits/constants/brackhits-comments.constants';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { BrackhitsCommentsUtils } from '../../brackhits/utils/brackhits-comments.utils';
import { ScheduledTaskService } from '../../tasks/services/scheduled-task.service';
import { FRIEND_ACCEPTED_NOTIFICATION_DELAY_MS } from '../../notifications/constants/notification.constants';
import { OneSignalService } from '../../one-signal/services/one-signal.service';
import { RepositoryService } from '../../repository/services/repository.service';
import { FriendRequestStatus } from '../../friends/constants';
import { CampaignsSpotifyUserTokensModel } from '@database/Models/campaign/campaigns-spotify-user-tokens.model';
import { SpotifySdk } from '../../spotify/services/spotify.sdk';
import { CampaignSpotifyUserTopTracksModel } from '@database/Models/campaign/campaign-spotify-user-top-tracks.model';
import { BrackhitsContentService } from '../../brackhits-content/services/brackhits-content.service';
import { CampaignSpotifyUserTopArtistsModel } from '@database/Models/campaign/campaign-spotify-user-top-artists.model';

@Injectable()
export class EventsHandlerService {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly brackhitsCalculationService: BrackhitsCalculationService,
    private readonly repositoryService: RepositoryService,
    private readonly scheduledTaskService: ScheduledTaskService,
    private readonly conversionApiService: ConversionApiService,
    private readonly oneSignalService: OneSignalService,
    private readonly spotifySdk: SpotifySdk,
    private readonly brackhitsContentService: BrackhitsContentService,
  ) {}

  async handleCreateUserEvent(data: AppEventPayload[AppEventName.CREATE_USER]): Promise<void> {
    const user = await AWSUsersModel.query()
      .withGraphFetched(expr([Relations.Profile]))
      .findOne({ sub: data.userId });

    console.log('CREATE_USER event triggered');
    await Promise.allSettled([
      this.conversionApiService.sendEvent({
        eventName: FacebookEventName.CreateUser,
        endpoint: `POST /link`,
        userData: {
          emails: [user.email],
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
        },
      }),
      this.oneSignalService.addUserEmailDevice({
        userId: user.sub,
        email: user.email,
      }),
    ]);
  }

  async handleConnectSpotifyEvent(
    data: AppEventPayload[AppEventName.CONNECT_SPOTIFY],
  ): Promise<void> {
    const user = await AWSUsersModel.query()
      .withGraphFetched(expr([Relations.Profile]))
      .findOne({ sub: data.userId });

    const facebookEventName =
      data.accountType === 'premium'
        ? FacebookEventName.ConnectSpotifyPremium
        : FacebookEventName.ConnectSpotifyFree;

    await this.conversionApiService.sendEvent({
      eventName: facebookEventName,
      endpoint: `POST /user/spotify-tokens`,
      userData: {
        emails: [user.email],
        firstName: user.profile.firstName,
        lastName: user.profile.lastName,
      },
    });
  }

  async handleUserSentFriendRequestEvent(
    data: AppEventPayload[AppEventName.USER_SENT_FRIEND_REQUEST],
  ): Promise<void> {
    const profile = await UserProfileInfoModel.query().findById(data.userId);

    const body = await this.notificationService.sendUserSentFriendRequestNotification(
      data.userId,
      profile.username,
      data.friendId,
    );

    if (body?.id) {
      await this.repositoryService.friendRepo.addOneSignalIdToFriendRequest(body.id, {
        userId: data.userId,
        userRequestedId: data.friendId,
        status: FriendRequestStatus.PENDING,
      });
    }
  }

  async handleUserAcceptedFriendRequest(
    data: AppEventPayload[AppEventName.USER_ACCEPTED_FRIEND_REQUEST],
  ): Promise<void> {
    setTimeout(async () => {
      const profile = await UserProfileInfoModel.query().findById(data.userId);

      await this.notificationService.sendUserAcceptedFriendRequestNotification(
        profile.username,
        data.friendId,
      );
    }, FRIEND_ACCEPTED_NOTIFICATION_DELAY_MS);
  }

  async handleCreateBrackhitEvent(
    data: AppEventPayload[AppEventName.CREATE_BRACKHIT],
  ): Promise<void> {
    const user = await AWSUsersModel.query()
      .withGraphFetched(expr([Relations.Profile]))
      .findOne({ sub: data.userId });

    await Promise.all([
      // this.scheduledTaskService.scheduleNewBrackhitOneMinuteAfterNotification(
      //   data.brackhitId,
      //   data.userId,
      // ),
      this.conversionApiService.sendEvent({
        eventName: FacebookEventName.CreateBrackhit,
        endpoint: `POST /brackhits`,
        userData: {
          emails: [user.email],
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
        },
      }),
    ]);
  }

  async handleUserCompleteBrackhitEvent(
    data: AppEventPayload[AppEventName.USER_COMPLETE_BRACKHIT],
  ): Promise<void> {
    const [user, friends] = await Promise.all([
      AWSUsersModel.query()
        .withGraphFetched(expr([Relations.Profile]))
        .findOne({ sub: data.userId }),
      UserFriendsModel.query()
        .select('uf.friend_id as userId', 'upi.username')
        .alias('uf')
        .join('labl.brackhit_user as bu', function () {
          this.onVal('bu.brackhit_id', data.brackhitId)
            .andOn('bu.user_id', 'uf.friend_id')
            .andOnVal('bu.is_complete', 1);
        })
        .joinRelated('friendProfile as upi')
        .where('uf.user_id', data.userId),
    ]);
    const friendIds = friends.map((el) => el.userId);

    await Promise.allSettled([
      this.scheduledTaskService.scheduleCreateBrackhitNotification(data.userId),
      this.oneSignalService.handleMadnessBrackhitCompleted(data.brackhitId, data.userId),
      this.notificationService.sendUserCompletedBrackhitNotification({
        friendIds,
        username: user.profile.username,
        brackhitId: data.brackhitId,
        brackhitName: data.brackhitName,
      }),
      this.conversionApiService.sendEvent({
        eventName: FacebookEventName.CompleteBrackhit,
        endpoint: `POST /brackhits/${data.brackhitId}/submit`,
        userData: {
          emails: [user.email],
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
        },
      }),
    ]);
  }

  async handleCalculateBrackhitResultsEvent(
    data: AppEventPayload[AppEventName.CALCULATE_BRACKHIT_RESULTS],
  ): Promise<void> {
    const brackhit = await BrackhitModel.query().findById(data.brackhitId);

    await Promise.all([
      BrackhitModel.query().patch({ duration: 0 }).where({ brackhitId: data.brackhitId }),
      this.brackhitsCalculationService.calculateBrackhitResults(data.brackhitId),
    ]);

    if (brackhit.scoringState === BrackhitScoringState.IN_PROGRESS) {
      const users = await BrackhitUserModel.query().where({
        brackhitId: data.brackhitId,
        isComplete: 1,
      });

      const userIds = users.map((el) => el.userId).filter((el) => el !== data.userId);

      await this.notificationService.sendBrackhitResultsNotification({
        userIds,
        brackhitId: brackhit.brackhitId,
        brackhitName: brackhit.name,
      });
    }
  }

  async handleBrackhitCreatorCompletionNotificationEvent(
    data: AppEventPayload[AppEventName.BRACKHIT_CREATOR_COMPLETIONS_NOTIFICATION],
  ): Promise<void> {
    await this.notificationService.sendBrackhitCreatorCompletionsNotification(data);
  }

  async handleCommentBrackhitEvent(
    data: AppEventPayload[AppEventName.COMMENT_BRACKHIT],
  ): Promise<void> {
    const isOwner = data.userId === data.ownerId;
    const user = await AWSUsersModel.query()
      .withGraphFetched(expr([Relations.Profile]))
      .findOne({ sub: data.userId });

    // brackhit owner does not receive a notification by commenting his own brackhit
    await Promise.all([
      isOwner || this.notificationService.sendBrackhitCommentNotification(data),
      this.conversionApiService.sendEvent({
        eventName: FacebookEventName.CommentBrackhit,
        endpoint: `POST /brackhits/comment`,
        userData: {
          emails: [user.email],
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
        },
      }),
    ]);
  }

  async handleReplyBrackhitCommentEvent(
    data: AppEventPayload[AppEventName.REPLY_BRACKHIT_COMMENT],
  ): Promise<void> {
    const user = await AWSUsersModel.query()
      .withGraphFetched(expr([Relations.Profile]))
      .findOne({ sub: data.userId });

    await Promise.all([
      this.notificationService.sendBrackhitCommentReplyNotification(data),
      this.conversionApiService.sendEvent({
        eventName: FacebookEventName.ReplyBrackhitComment,
        endpoint: `POST /brackhits/${data.commentId}/reply`,
        userData: {
          emails: [user.email],
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
        },
      }),
    ]);
  }

  async handleBrackhitCommentLikeEvent(
    data: AppEventPayload[AppEventName.BRACKHIT_COMMENT_LIKE],
  ): Promise<void> {
    let commentQB: QueryBuilder<
      BrackhitCommentsModel | BrackhitRepliesModel,
      BrackhitCommentsModel | BrackhitRepliesModel
    >;

    if (data.type === BrackhitCommentTypes.Comment) {
      commentQB = this.repositoryService.brackhitCommentRepo
        .getCommentWithLikes(data.commentId)
        .select('bc.*', 'likes.totalLikes');
    } else if (data.type === BrackhitCommentTypes.Reply) {
      commentQB = this.repositoryService.brackhitCommentRepo
        .getReplyWithLikes(data.commentId)
        .select('br.*', 'likes.totalLikes');
    }

    QueryBuilderUtils.fetchRelationsToBuilder(commentQB, [
      {
        relation: Relations.Brackhit,
        select: ['labl.brackhit.brackhitId', 'name'],
      },
    ]);

    const comment = await commentQB;

    if (BrackhitsCommentsUtils.isNotifiableCommentLike(comment.totalLikes)) {
      await this.notificationService.sendBrackhitCommentLikeNotification(comment);
    }
  }

  async handleCreateBrackhitChallengeEvent(
    data: AppEventPayload[AppEventName.CREATE_BRACKHIT_CHALLENGE],
  ): Promise<void> {
    await this.scheduledTaskService.scheduleBrackhitChallengeWinnerNotification(data.challengeId);
  }

  async handleFetchUserSpotifyTopTracksEvent(
    data: AppEventPayload[AppEventName.FETCH_USER_SPOTIFY_TOP_TRACKS],
  ): Promise<void> {
    const tokens = await CampaignsSpotifyUserTokensModel.query().findOne({ userId: data.userId });

    if (!tokens) {
      console.log('No tokens found for user', data.userId);
    }

    let shortTermTracks, mediumTermTracks, longTermTracks;
    try {
      this.spotifySdk.setAccessToken(tokens.accessToken);
      [shortTermTracks, mediumTermTracks, longTermTracks] = await Promise.all([
        this.spotifySdk.getTopTracks({ time_range: 'short_term', limit: 10 }),
        this.spotifySdk.getTopTracks({ time_range: 'medium_term', limit: 10 }),
        this.spotifySdk.getTopTracks({ time_range: 'long_term', limit: 10 }),
      ]);
    } catch (err) {
      console.error('Error fetching top tracks', err);
      return;
    }

    const tracks = {
      short_term: shortTermTracks.items,
      medium_term: mediumTermTracks.items,
      long_term: longTermTracks.items,
    };

    await Promise.all(
      Object.keys(tracks).map(async (period) => {
        await Promise.all(
          tracks[period].map(async (track, i) => {
            let content = await this.brackhitsContentService.getContent(
              track.id,
              BrackhitContentType.Track,
            );

            if (!content) {
              content = await this.brackhitsContentService.saveContent(
                track.id,
                BrackhitContentType.Track,
              );
            }

            await CampaignSpotifyUserTopTracksModel.query()
              .insert({
                campaignUserId: data.userId,
                campaignId: data.campaignId,
                spotifyTrackId: content.id,
                period: period,
                position: i + 1,
              })
              .onConflict()
              .merge(['position']);
          }),
        );
      }),
    );

    console.log('Tracks saved');
  }

  async handleFetchUserSpotifyTopArtistsEvent(
    data: AppEventPayload[AppEventName.FETCH_USER_SPOTIFY_TOP_ARTISTS],
  ): Promise<void> {
    const tokens = await CampaignsSpotifyUserTokensModel.query().findOne({ userId: data.userId });

    if (!tokens) {
      console.log('No tokens found for user', data.userId);
    }

    let shortTermArtists, mediumTermArtists, longTermArtists;
    try {
      this.spotifySdk.setAccessToken(tokens.accessToken);
      [shortTermArtists, mediumTermArtists, longTermArtists] = await Promise.all([
        this.spotifySdk.getTopArtists({ time_range: 'short_term', limit: 10 }),
        this.spotifySdk.getTopArtists({ time_range: 'medium_term', limit: 10 }),
        this.spotifySdk.getTopArtists({ time_range: 'long_term', limit: 10 }),
      ]);
    } catch (err) {
      console.error('Error fetching top artists', err);
      return;
    }

    const artists = {
      short_term: shortTermArtists.items,
      medium_term: mediumTermArtists.items,
      long_term: longTermArtists.items,
    };

    await Promise.all(
      Object.keys(artists).map(async (period) => {
        await Promise.all(
          artists[period].map(async (artist, i) => {
            let content = await this.brackhitsContentService.getContent(
              artist.id,
              BrackhitContentType.Artist,
            );

            if (!content) {
              content = await this.brackhitsContentService.saveContent(
                artist.id,
                BrackhitContentType.Artist,
              );
            }

            await CampaignSpotifyUserTopArtistsModel.query()
              .insert({
                campaignUserId: data.userId,
                campaignId: data.campaignId,
                spotifyArtistId: (content as ArtistModel).spotifyArtist.id,
                period: period,
                position: i + 1,
              })
              .onConflict()
              .merge(['position']);
          }),
        );
      }),
    );

    console.log('Artists saved');
  }
}
