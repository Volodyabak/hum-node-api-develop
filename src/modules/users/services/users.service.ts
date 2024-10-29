import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ArtistModel,
  AWSUsersModel,
  BadgesModel,
  UserFeedPreferencesModel,
  UserFriendsModel,
  UserProfileInfoModel,
} from '../../../../database/Models';
import { ArtistService } from '../../../Services/Artist/ArtistService';
import {
  FriendTopArtistDto,
  FriendTopTrackDto,
  FullUserProfileDto,
  GetUserBrackhitsParams,
  UserTopArtistDto,
  UserTopCategoryDto,
  UserTopStatsDto,
  UserTopTrackDto,
} from '../dto/users.dto';
import { AppSettingsService } from '../../../Services/AppSettings/AppSettingsService';
import { TrackService } from '../../../Services/Track/TrackService';
import { BadRequestError, NotFoundError } from '../../../Errors';
import { SpotifyUserTokensModel } from '../../../../database/Models/Spotify/SpotifyUserTokensModel';
import { SearchedUserDto, SearchUsersQueryDto } from '../../friends/dto/friends.dto';
import { RestfulQuery } from '../../../decorators/restful-query.decorator';
import { UsersParser } from './users-parser';
import { Relations } from '../../../../database/relations/relations';
import { JoinOperation, PaginatedItems, PaginationParams } from '../../../Tools/dto/util-classes';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import {
  GetSharedBrackhitsResponseDto,
  GetSpotifyUserPlaylistsResponseDto,
  GetUserArtistsQueryDto,
  GetUserSpotifyPlaylistsQueryDto,
  PostUserGetMeBodyDto,
  UserLikesOutput,
} from '../dto/users-api.dto';
import { RepositoryService } from '../../repository/services/repository.service';
import { ErrorConst, GUEST_USER_ID } from '../../../constants';
import { Model } from 'objection';
import { CognitoService } from '../../aws/services/cognito.service';
import { expr } from '../../../../database/relations/relation-builder';
import {
  GetBrackhitTopArtistsResponseDto,
  GetBrackhitTopTracksResponseDto,
} from '../../brackhits/api-dto/brackhits-api.dto';
import { BrackhitTopParams } from '../../brackhits/interfaces/brackhits.interface';
import { PaginationQueryDto } from '../../../Tools/dto/main-api.dto';
import { SharedBrackhitDto } from '../../brackhits/dto/brackhits.dto';
import { BrackhitsService } from '../../brackhits/services/brackhits.service';
import { UserBrackhitChoiceMeta, UserTopChoiceMeta } from '../interfaces/users.interface';
import { StreamingService } from '../../spotify/constants';
import { SpotifyService } from '../../spotify/services/spotify.service';
import { SpotifyUtils } from '../../spotify/utils/spotify.utils';
import { ConstantId } from '../../constants/constants';
import { FriendsService } from '../../friends/services/friends.service';
import { FeedService } from '../../feed/services/feed.service';
import { UserLocationInput } from '../dto/input/put-user-location.input.dto';
import { PutUserLocationOutput } from '../dto/output/put-user-location.output.dto';
import { SearchRadius } from '../models/location/user-search-radius.model';
import { InteractionTypes } from '../../analytics/constants';

@Injectable()
export class UsersService {
  constructor(
    @Inject(forwardRef(() => BrackhitsService))
    private readonly brackhitsService: BrackhitsService,
    private readonly repoService: RepositoryService,
    private readonly cognitoService: CognitoService,
    private readonly spotifyService: SpotifyService,
    private readonly friendsService: FriendsService,
    private readonly feedService: FeedService,
  ) {}

  async searchUsersByQuery(
    userId: string,
    query: SearchUsersQueryDto,
  ): Promise<PaginatedItems<SearchedUserDto>> {
    const usersQB = this.repoService.userRepo.searchUsersByQuery(query.query);
    const totalQB = usersQB.clone().resultSize();

    usersQB.leftJoinRelated(expr([Relations.UserInfluencer, 'ui']));
    QueryBuilderUtils.addPaginationToBuilder(usersQB, query);
    this.repoService.userRepo.joinUserFriendRelationshipToUserProfile(usersQB, userId, {
      from: 'upi',
    });

    usersQB
      .select(
        'upi.userId',
        'upi.firstName',
        'upi.lastName',
        'upi.userHometown',
        'upi.userBio',
        'upi.userImage',
        'ui.typeId as influencerType',
        'upi.username',
      )
      .orderByRaw('relationshipOrder')
      .orderBy('upi.username');

    const [users, total] = await Promise.all([usersQB, totalQB]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: UsersParser.parseSearchedUsers(users),
    };
  }

  async getUserMostListenedArtists(
    userId: string,
    params: PaginationParams,
  ): Promise<FriendTopArtistDto[]> {
    const artists = await this.repoService.userRepo.getUserMostListenedArtists(userId, params);

    return Promise.all(
      artists.map((artist) => {
        return ArtistService.getArtistProfile(artist.artistId).then((profile) => ({
          ...profile,
          rank: artist.rank,
        }));
      }),
    );
  }

  async getUserTopCategories(userId: string): Promise<UserTopCategoryDto[]> {
    return this.repoService.userRepo.getUserTopCategories(userId);
  }

  async getUserTopRecentTracks(
    userId: string,
    params: PaginationParams,
  ): Promise<FriendTopTrackDto[]> {
    const tracks = await this.repoService.userRepo.getUserTopRecentTracks(userId, params);
    const settings = await AppSettingsService.getAppSettingsState();

    return Promise.all(
      tracks.map((track) => {
        return TrackService.getTrackInfo(track.id, settings).then((info) => ({
          ...info,
          ranking: track.rank,
        }));
      }),
    );
  }

  async getFullUserProfile(userId: string): Promise<FullUserProfileDto> {
    const [user, profile, artistCount, friendsCount] = await Promise.all([
      this.getAWSUser(userId),
      this.getUserProfileInfo(userId),
      this.repoService.userRepo.getUserArtists(userId).resultSize(),
      this.repoService.userRepo.getUserFriends(userId).resultSize(),
    ]);

    if (!user) {
      throw new NotFoundError(ErrorConst.AWS_USER_NOT_FOUND);
    }

    return {
      ...profile,
      joinDate: user.dateInserted,
      followedArtistsCount: artistCount,
      friendsCount,
    };
  }

  async getAWSUser(userId: string): Promise<AWSUsersModel> {
    return this.repoService.userRepo.getAwsUser(userId);
  }

  async getUserProfileInfo(userId: string): Promise<UserProfileInfoModel> {
    const profile = await this.repoService.userRepo
      .getUserProfileInfo(userId)
      .select('upi.*', 'ui.typeId as influencerType')
      .leftJoinRelated(expr([Relations.UserInfluencer, 'ui']));

    if (!profile) {
      throw new NotFoundError(ErrorConst.USER_PROFILE_NOT_FOUND);
    }

    profile.profileComplete = profile.createdAt.toISOString() !== profile.updatedAt.toISOString();

    return profile;
  }

  async getUserFriends(
    userId: string,
    params = {
      withCompatability: false,
    },
  ): Promise<UserFriendsModel[]> {
    if (params.withCompatability) {
      return this.repoService.userRepo
        .getUserFriendsWithCompatibility(userId)
        .orderBy('ufc.compatability', 'desc');
    } else {
      return this.repoService.userRepo.getUserFriends(userId).orderBy('timestamp', 'desc');
    }
  }

  async getUserBadges(userId: string): Promise<BadgesModel[]> {
    return this.repoService.userRepo
      .getUserBadges(userId)
      .select('b.id as badgeId', 'b.badge as badgeName');
  }

  async getUserGenres(userId: string) {
    const genres = await this.repoService.userRepo.getUserGenres(userId);
    const genresPercentage = genres.reduce((prev, curr) => prev + curr.p, 0);

    genres.push({
      genre_name: 'Other',
      p: 1 - genresPercentage,
    });

    return genres;
  }

  async getSpotifyUserToken(userId: string): Promise<SpotifyUserTokensModel> {
    return this.repoService.userRepo.getUserSpotifyToken(userId);
  }

  async getUserByRestQuery(restQuery?: RestfulQuery): Promise<AWSUsersModel[]> {
    return this.repoService.userRepo.getUserByRestQuery(restQuery);
  }

  async getUserByRestQueryCount(restQuery: RestfulQuery): Promise<number> {
    return this.repoService.userRepo.getUserByRestQueryCount(restQuery);
  }

  // returns PaginatedItems object containing user brackhits and number of completed brackhits as a value
  async getUserBrackhitsPI(
    userId: string,
    params: GetUserBrackhitsParams,
  ): Promise<PaginatedItems<BrackhitModel, number>> {
    const userBrackhitsQB = this.repoService.userRepo.getUserBrackhits(userId);

    if (params.completed === 1) {
      userBrackhitsQB.where('bu.isComplete', 1);
    } else if (params.completed === 0) {
      userBrackhitsQB.where('bu.isComplete', 0);
    }

    const totalQB = userBrackhitsQB.clone().resultSize();
    let completedQB;

    if (params.completed === 1) {
      completedQB = totalQB;
    } else if (params.completed === 0) {
      completedQB = 0;
    } else {
      completedQB = userBrackhitsQB.clone().where('bu.isComplete', 1).resultSize();
    }

    if (params.completed) {
      userBrackhitsQB.orderBy('bu.updatedAt', 'desc');
    } else {
      userBrackhitsQB.orderBy('bu.isComplete', 'desc').orderBy('bu.updatedAt', 'desc');
    }

    QueryBuilderUtils.addPaginationToBuilder(userBrackhitsQB, params);

    userBrackhitsQB.select('b.brackhitId', 'b.name', 'b.thumbnail', 'bu.isComplete');

    const [brackhits, total, completed] = await Promise.all([
      userBrackhitsQB,
      totalQB,
      completedQB,
    ]);

    // sort inProgress brackhits by lastChoiceTime desc
    if (!params.completed) {
      const startIndex = brackhits.findIndex((b) => b.isComplete === 0);
      if (startIndex > -1) {
        const inProgressBrackhits = brackhits
          .slice(startIndex, brackhits.length)
          .sort((b1, b2) => b2.lastChoiceTime.getTime() - b1.lastChoiceTime.getTime());

        brackhits.splice(startIndex, inProgressBrackhits.length, ...inProgressBrackhits);
      }
    }

    return {
      skip: params.skip,
      take: params.take,
      total,
      value: completed,
      items: brackhits,
    };
  }

  // returns PaginatedItems object containing user created brackhits
  async getUserCreatedBrackhitsPI(
    userId: string,
    params: PaginationParams,
  ): Promise<PaginatedItems<BrackhitModel>> {
    const brackhitsQB = this.repoService.userRepo.getUserCreatedBrackhits(userId);
    const totalQB = brackhitsQB.clone();

    this.repoService.brackhitRepo.joinBrackhitUserToBuilder(brackhitsQB, userId);
    this.repoService.brackhitRepo.sortBrackhitsByCompletions(brackhitsQB);
    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, params);

    brackhitsQB.select(
      'b.brackhitId',
      'b.name',
      'b.thumbnail',
      'bu.isComplete',
      'comp.completions',
    );

    const [brackhits, total] = await Promise.all([brackhitsQB, totalQB.resultSize()]);

    return {
      skip: params.skip,
      take: params.take,
      total,
      items: brackhits,
    };
  }

  async getUserTopTracks(
    userId: string,
    params: BrackhitTopParams,
  ): Promise<GetBrackhitTopTracksResponseDto> {
    const tracksQB = this.repoService.userRepo.getUserTopTracks(userId);
    const totalQB = params.excludeTotal ? undefined : tracksQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(tracksQB, params);
    QueryBuilderUtils.fetchRelationsToBuilder(tracksQB, [
      {
        relation: Relations.Artists,
        select: ['artistKey as key', 'artistName as name'],
      },
      {
        relation: Relations.Album,
        select: ['albumImage as image'],
      },
    ]);
    tracksQB
      .select(
        'st.id',
        'st.trackKey as key',
        'st.trackName as name',
        'st.trackPreview as preview',
        'sub.total as userValue',
      )
      .orderBy('sub.total', 'desc')
      .orderBy('st.id', 'desc');

    const [tracks, total] = await Promise.all([tracksQB.castTo<UserTopTrackDto[]>(), totalQB]);

    return {
      userId,
      skip: params.skip,
      take: params.take,
      total,
      tracks,
    };
  }

  async getUserTopArtists(
    userId: string,
    params: BrackhitTopParams,
  ): Promise<GetBrackhitTopArtistsResponseDto> {
    const artistsQB = this.repoService.userRepo.getUserTopArtists(userId);
    const totalQB = params.excludeTotal ? undefined : artistsQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(artistsQB, params);
    artistsQB
      .select(
        'a.id',
        'sa.artistKey as key',
        'a.facebookName as name',
        'a.imageFile as image',
        'sub.total as userValue',
      )
      .orderBy('sub.total', 'desc')
      .orderBy('sa.id', 'desc');

    const [artists, total] = await Promise.all([artistsQB.castTo<UserTopArtistDto[]>(), totalQB]);

    return {
      userId,
      skip: params.skip,
      take: params.take,
      total,
      artists,
    };
  }

  async getUserTopChoices(userId: string, params: BrackhitTopParams) {
    const choicesQB = this.repoService.userRepo.getUserTopChoices(userId);
    const totalQB = choicesQB.clone().resultSize();

    choicesQB.select(
      'buc.brackhitId',
      'b.name',
      'b.thumbnail',
      'b:bt.type',
      'buc.choiceId',
      'buc.choiceTime',
    );

    const trackChoicesQB = this.repoService.trackRepo.addTrackInfoToChoices(choicesQB, {
      excludeArtists: false,
      groupByRound: false,
    });

    QueryBuilderUtils.addPaginationToBuilder(trackChoicesQB, params);
    trackChoicesQB.groupBy('sub.choiceTime').orderBy('sub.choiceTime', 'desc');

    const [choices, total] = await Promise.all([
      trackChoicesQB.castTo<UserTopChoiceMeta[]>(),
      totalQB,
    ]);

    return {
      userId,
      skip: params.skip,
      take: params.take,
      total,
      choices: choices.map((el) => UsersParser.parseUserTopChoices(el)),
    };
  }

  async getUserTopStats(userId: string): Promise<UserTopStatsDto> {
    // take only first element
    const params: BrackhitTopParams = { skip: 0, take: 1, excludeTotal: true };

    const [topTracks, topArtists] = await Promise.all([
      this.getUserTopTracks(userId, params),
      this.getUserTopArtists(userId, params),
    ]);

    return {
      track: topTracks.tracks[0],
      artist: topArtists.artists[0],
    };
  }

  async getUserArtists(
    tokenUserId: string,
    paramUserId: string,
    query: GetUserArtistsQueryDto,
  ): Promise<PaginatedItems<ArtistModel>> {
    const artistsQB = this.repoService.userRepo.getUserArtists(paramUserId);
    const totalQB = artistsQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(artistsQB, query);
    this.repoService.artistRepo.joinDailyScoreToArtistsQB(artistsQB, {
      from: 'a',
      to: 'ds',
      join: JoinOperation.leftJoin,
    });

    artistsQB
      .select(
        'a.id',
        'a.facebookName',
        'a.imageFile',
        'g.genreName',
        'ufp1.artistId as tokenUserArtistId',
      )
      .leftJoinRelated(expr([Relations.Genre, 'g']))
      .leftJoin(
        UserFeedPreferencesModel.getTableNameWithAlias('ufp1'),
        UserFeedPreferencesModel.callbacks.onArtistIdAndUserIdVal(tokenUserId, 'a', 'ufp1'),
      )
      .orderBy('ds.dailyPoints', 'desc')
      .orderBy('a.id', 'desc');

    const [artists, total] = await Promise.all([artistsQB, totalQB]);

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: artists,
    };
  }

  async saveArtistsToUserFeed(
    userId: string,
    artistIds: number[],
  ): Promise<UserFeedPreferencesModel[]> {
    return Promise.all(
      artistIds.map((id) => {
        return this.repoService.userRepo.saveArtistToUserFeed(userId, id);
      }),
    );
  }

  async deleteArtistsFromUserFeed(userId: string, artistIds: number[]): Promise<number[]> {
    return Promise.all(
      artistIds.map((id) => {
        return this.repoService.userRepo.deleteArtistFromUserFeed(userId, id);
      }),
    );
  }

  async deleteAwsUser(userId: string, accessToken: string) {
    if (userId === GUEST_USER_ID) {
      throw new BadRequestError(ErrorConst.CAN_NOT_DELETE_GUEST_USER);
    }

    const user = await AWSUsersModel.query().findOne({ sub: userId });
    if (!user) {
      throw new NotFoundError(ErrorConst.AWS_USER_NOT_FOUND);
    }

    const trx = await Model.startTransaction();

    try {
      const deleted = await this.repoService.brackhitRepo.deleteUserCreatedBrackhits(userId, trx);
      await this.repoService.analyticsRepo.saveUserDeleteLog(
        {
          userId,
          brackhitsCreated: deleted,
          createdAt: user.dateInserted,
        },
        trx,
      );
      await this.repoService.userRepo.deleteAwsUser(userId, trx);
      await this.cognitoService.deleteUser(accessToken);
      await trx.commit();
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async getUserSpotifyPlaylistsResponse(
    userId: string,
    query: GetUserSpotifyPlaylistsQueryDto,
  ): Promise<GetSpotifyUserPlaylistsResponseDto> {
    const accessData = await this.spotifyService.getUserAccessData(userId);
    if (!accessData) {
      throw new BadRequestError(`${userId} does not have a spotify token`);
    }

    const playlistsData = await this.spotifyService.getUserPlaylists(accessData, query);

    return {
      userId,
      skip: playlistsData.skip,
      take: playlistsData.take,
      total: playlistsData.total,
      playlists: playlistsData.items,
    };
  }

  async updateAwsUser(userId: string, body: PostUserGetMeBodyDto): Promise<AWSUsersModel> {
    const user = await AWSUsersModel.query().findOne('sub', userId);
    return user.$query().updateAndFetch({
      deviceType: body.deviceType,
    });
  }

  async getSharedBrackhits(
    firstUserId: string,
    secondUserId: string,
    query: PaginationQueryDto,
  ): Promise<GetSharedBrackhitsResponseDto> {
    const brackhitsQB = this.repoService.userRepo.getSharedBrackhits(firstUserId, secondUserId);
    const totalQB = brackhitsQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(brackhitsQB, query);
    brackhitsQB.select('b.brackhitId', 'b.name', 'b.thumbnail').orderBy('b.brackhitId', 'desc');

    const [brackhits, total] = await Promise.all([
      brackhitsQB.castTo<SharedBrackhitDto[]>(),
      totalQB,
    ]);

    return {
      tokenUserId: firstUserId,
      paramUserId: secondUserId,
      skip: query.skip,
      take: query.take,
      total,
      brackhits,
    };
  }

  async getUserBrackhitsChoices(tokenUserId: string, paramUserId: string, brackhitId: number) {
    const [brackhit, tokenUserBrackhit, paramUserBrackhit] = await Promise.all([
      this.brackhitsService.getBrackhitById(brackhitId),
      this.repoService.userRepo.getUserBrackhit(brackhitId, tokenUserId),
      this.repoService.userRepo.getUserBrackhit(brackhitId, paramUserId),
    ]);

    // do not change, because FE awaits for error with status code 404
    if (!paramUserBrackhit) {
      throw new NotFoundException(ErrorConst.BRACKHIT_IS_NOT_COMPLETED);
    }

    if (!paramUserBrackhit?.isComplete && tokenUserId !== paramUserId) {
      throw new BadRequestError('The user has not submit their results yet');
    }

    const choicesQB = this.repoService.userRepo.getBrackhitChoices(brackhitId, paramUserId);
    choicesQB
      .select(
        'buc.userId',
        'buc.brackhitId',
        'buc.roundId',
        'buc.choiceId',
        'bc.contentId',
        'bc:ct.contentType as type',
      )
      .joinRelated(expr([Relations.Content, 'bc', [Relations.ContentType, 'ct']]));

    const tracksQB = this.repoService.trackRepo
      .addTrackInfoToChoices(choicesQB, { excludeArtists: false, groupByRound: true })
      .orderBy('sub.roundId');

    const choices = await tracksQB.castTo<UserBrackhitChoiceMeta[]>();

    return {
      brackhit,
      isComplete: paramUserBrackhit.isComplete,
      tokenUserComplete: tokenUserBrackhit?.isComplete || 0,
      choices: UsersParser.parseUserBrackhitChoices(choices),
    };
  }

  async getMe(userId: string) {
    const [user, profile, stats, devices, appVersion, streaming, artists, brackhits] =
      await Promise.all([
        this.repoService.userRepo.getAwsUser(userId),
        this.getUserProfileInfo(userId),
        this.getUserStats(userId),
        this.repoService.userRepo.getUserDevices(userId).resultSize(),
        this.getUserAppVersion(userId),
        this.getUserAccountStreamingData(userId),
        this.getUserProfileArtists(userId),
        this.getUserProfileBrackhits(userId),
      ]);

    return {
      profile,
      stats,
      settings: {
        joinDate: user.dateInserted,
        appVersion,
        deviceType: user.deviceType,
        pushStatus: devices > 0 ? 1 : 0,
        streaming,
      },
      artists,
      brackhits,
    };
  }

  async getUserProfile(tokenUserId: string, paramUserId: string) {
    const [profile, stats, status, artists, brackhits] = await Promise.all([
      this.getUserProfileInfo(paramUserId),
      this.getUserStats(paramUserId),
      this.friendsService.getUserFriendStatus(tokenUserId, paramUserId),
      this.getUserProfileArtists(paramUserId),
      this.getUserProfileBrackhits(paramUserId),
    ]);

    return {
      status,
      profile,
      stats,
      artists,
      brackhits,
    };
  }

  async getUserAccountStreamingData(userId: string) {
    let service = StreamingService.NONE;
    let serviceStatus = null;
    let exp = null;

    const [spotifyToken, appleMusicToken] = await Promise.all([
      this.repoService.userRepo.getUserSpotifyToken(userId),
      this.repoService.appleMusic.getAppleMusicUserToken(userId),
    ]);

    if (spotifyToken) {
      service = StreamingService.SPOTIFY;
      serviceStatus = SpotifyUtils.getUserSpotifyServiceStatus(spotifyToken);
      exp = spotifyToken.expireTime;
    } else if (appleMusicToken) {
      service = StreamingService.APPLE_MUSIC;
      exp = appleMusicToken.exp;
    }

    return { service, serviceStatus, exp };
  }

  async getUserStats(userId: string) {
    const [friends, createdBrackhits, completedBrackhits, artists] = await Promise.all([
      this.repoService.userRepo.getUserFriends(userId).resultSize(),
      this.repoService.userRepo.getUserCreatedBrackhits(userId).resultSize(),
      this.repoService.userRepo.getUserCompletedBrackhits(userId).resultSize(),
      this.repoService.userRepo.getUserArtists(userId).resultSize(),
    ]);

    return {
      friends,
      createdBrackhits,
      completedBrackhits,
      artists,
    };
  }

  async getUserAppVersion(userId: string) {
    const version = await this.repoService.userRepo
      .getUserAppVersions(userId)
      .orderBy('uav.timestamp', 'desc')
      .first();

    return version.appVersion;
  }

  async getUserProfileArtists(userId: string): Promise<ArtistModel[]> {
    const constant = await this.repoService.constantsRepo.getConstant(
      ConstantId.USER_PROFILE_ARTISTS_COUNT,
    );

    return this.repoService.userRepo
      .getUserArtists(userId)
      .select('a.id', 'a.facebookName as name', 'a.imageFile as image')
      .orderBy('a.facebookName')
      .limit(constant.value);
  }

  async getUserProfileBrackhits(userId: string): Promise<BrackhitModel[]> {
    const constant = await this.repoService.constantsRepo.getConstant(
      ConstantId.USER_PROFILE_BRACKHITS_COUNT,
    );

    const completions = this.repoService.brackhitRepo.getBrackhitsCompletions('completions');

    return this.repoService.userRepo
      .getUserCreatedBrackhits(userId)
      .select('b.brackhitId', 'b.name', 'b.thumbnail', 'comp.completions')
      .join(completions.as('comp'), 'comp.brackhitId', 'b.brackhitId')
      .orderBy('b.brackhitId', 'desc')
      .limit(constant.value);
  }

  async getUserLikes(userId: string, query: PaginationQueryDto): Promise<UserLikesOutput> {
    const likedContentQB = this.repoService.userRepo.getUserLikedContent(userId);
    const totalQB = await likedContentQB.clone().resultSize();

    QueryBuilderUtils.addPaginationToBuilder(likedContentQB, query);

    const [likedContent, total] = await Promise.all([likedContentQB, totalQB]);

    const data = await Promise.all(
      likedContent.map(async (el) => {
        const feedItemQB = this.repoService.feedRepo.getArtistFeedItem(el.centralId);
        this.repoService.feedRepo.joinFeedMetaToBuilder(feedItemQB, new Date());

        const feedItem = await feedItemQB;

        if (!feedItem) {
          return null;
        }

        const source = await this.feedService.getFeedItemSourceV2(feedItem);

        return {
          id: el.id,
          centralId: feedItem.centralId,
          feedType: feedItem.feedType,
          timestamp: feedItem.timestamp,
          artist: feedItem.artist,
          source,
        };
      }),
    );

    return {
      skip: query.skip,
      take: query.take,
      total: total,
      data: data.filter((el) => el),
    };
  }

  async deleteUserLikes(userId: string, centralId: number) {
    const like = await this.repoService.analyticsRepo.findContentLog({
      userId,
      centralId,
      interactionId: InteractionTypes.Like,
    });

    if (!like) {
      throw new BadRequestError(ErrorConst.LIKE_NOT_FOUND);
    }

    return this.repoService.analyticsRepo.deleteContentLog(like.id);
  }

  async updateUserLocation(
    userId: string,
    body: UserLocationInput,
  ): Promise<PutUserLocationOutput> {
    if (!body.coordinates?.longitude && !body.coordinates?.latitude && !body.searchingRadius) {
      throw new BadRequestException(ErrorConst.COORDINATES_OR_RADIUS_REQUIRED);
    }

    const [location, searchRadius] = await Promise.all([
      this.repoService.userRepo.getUserLocation({ userId }),
      this.repoService.userRepo
        .getUserSearchRadius({ userId })
        .withGraphFetched(expr([Relations.SearchRadius])),
    ]);

    if (!body.searchingRadius && !searchRadius) {
      body.searchingRadius = SearchRadius.TwentyFiveMiles;
    }

    const promises = [];

    if (body.coordinates) {
      if (!location) {
        promises[0] = this.repoService.userRepo.insertUserLocation({
          userId,
          longitude: body.coordinates.longitude,
          latitude: body.coordinates.latitude,
        });
      } else {
        promises[0] = location.$query().patchAndFetch({
          longitude: body.coordinates.longitude,
          latitude: body.coordinates.latitude,
        });
      }
    }

    if (body.searchingRadius) {
      if (!searchRadius) {
        promises[1] = this.repoService.userRepo
          .insertUserSearchRadius({ userId, searchRadiusId: body.searchingRadius })
          .withGraphFetched(expr([Relations.SearchRadius]));
      } else if (searchRadius.searchRadiusId !== body.searchingRadius) {
        promises[1] = searchRadius
          .$query()
          .patchAndFetchById(searchRadius.userId, { searchRadiusId: body.searchingRadius })
          .withGraphFetched(expr([Relations.SearchRadius]));
      }
    }

    const [updatedLocation, updatedSearchRadius] = await Promise.all(promises);

    return {
      location: updatedLocation || location,
      searchRadius: updatedSearchRadius || searchRadius,
    };
  }
}
