import { forwardRef, Inject, Injectable } from '@nestjs/common';
import {
  ArtistModel,
  AWSUsersModel,
  BadgesModel,
  LogContentModel,
  SpotifyArtistModel,
  SpotifyTrackModel,
  UserAppVersionModel,
  UserDevicesModel,
  UserFeedPreferencesModel,
  UserFriendRequestsModel,
  UserFriendsModel,
  UserProfileInfoModel,
} from '../../../../../database/Models';
import { Database } from '../../../../../database/database';
import { UserGenreDto, UserTopCategoryDto } from '../../../users/dto/users.dto';
import {
  GET_USER_GENRES,
  GET_USER_MOST_LISTENED_ARTISTS,
  GET_USER_TOP_CATEGORIES,
  GET_USER_TOP_RECENT_TRACKS,
} from '../../../friends/queries/friends.queries';
import { JoinOperation, JoinParams, PaginationParams } from '../../../../Tools/dto/util-classes';
import { SpotifyUserTokensModel } from '../../../../../database/Models/Spotify/SpotifyUserTokensModel';
import {
  joinOrderParamsToQueryBuilder,
  joinPaginationParamsToQueryBuilder,
  joinSearchParamsToQueryBuilder,
  RestfulQuery,
} from '../../../../decorators/restful-query.decorator';
import { expr } from '../../../../../database/relations/relation-builder';
import { Relations } from '../../../../../database/relations/relations';
import { QueryBuilder, raw, Transaction } from 'objection';
import { BrackhitCategory } from '../../../brackhits/constants/brackhits-hub.constants';
import { TopUsersParamsDto, UserItemDto } from '../../../brackhits/dto/brackhits-home.dto';
import { BrackhitModel } from '../../../../../database/Models/BrackhitModel';
import { BrackhitUserModel } from '../../../../../database/Models/BrackhitUserModel';
import { BrackhitUserChoicesModel } from '../../../../../database/Models/BrackhitUserChoicesModel';
import {
  BrackhitSize,
  BrackhitUserCompleteStatus,
} from '../../../brackhits/constants/brackhits.constants';
import {
  GET_USER_SPOTIFY_TOKENS,
  UPDATE_SPOTIFY_USER_TOKENS,
} from '../../../users/queries/users.queries';
import { BrackhitRepository } from '../brackhit/brackhit.repository';
import { UserLocationModel } from '../../../users/models/location/user-location.model';
import { UserSearchRadiusModel } from '../../../users/models/location/user-search-radius.model';
import { InteractionTypes } from '../../../analytics/constants';

@Injectable()
export class UserRepository {
  constructor(
    @Inject(forwardRef(() => BrackhitRepository))
    private readonly brackhitRepo: BrackhitRepository,
  ) {}

  findAwsUser(data: Partial<AWSUsersModel>) {
    return AWSUsersModel.query().findOne(data);
  }

  async saveAwsUser(
    userId: string,
    username: string,
    userData: Partial<AWSUsersModel>,
    profile: Partial<UserProfileInfoModel>,
  ) {
    return AWSUsersModel.query().insertGraphAndFetch({
      ...userData,
      sub: userId,
      username: username,
      profile: {
        ...profile,
        userId: userId,
        username: username,
      },
    });
  }

  searchUsersByQuery(query: string) {
    const queryExpr = `%${query}%`;

    return UserProfileInfoModel.query()
      .alias('upi')
      .whereRaw(`CONCAT(upi.first_name, \' \', upi.last_name) LIKE \'${queryExpr}\'`)
      .orWhere('upi.username', 'like', queryExpr);
  }

  getAwsUser(userId: string) {
    return AWSUsersModel.query().where('sub', userId).first();
  }

  getUserArtists(userId: string) {
    return ArtistModel.query()
      .alias('a')
      .joinRelated(expr([Relations.UserFeed, 'ufp']))
      .where('ufp.userId', userId);
  }

  getUserProfileInfo(userId: string) {
    return UserProfileInfoModel.query().alias('upi').findOne('upi.userId', userId);
  }

  getUserFriends(userId: string) {
    return UserFriendsModel.query().where('userId', userId);
  }

  getUserFriendsWithCompatibility(userId: string) {
    return UserFriendsModel.query()
      .alias('uf')
      .where('userId', userId)
      .leftJoin('labl.user_friend_compatability as ufc', function () {
        this.on('ufc.user_id', 'uf.user_id').andOn('ufc.friend_id', 'uf.friend_id');
      });
  }

  getUserBadges(userId: string) {
    return BadgesModel.query()
      .alias('b')
      .joinRelated('[userBadges as ub.[userBadgesChecked as ubc]]')
      .whereColumn('ub.last_checked', '>=', 'ub:ubc.last_checked')
      .andWhere('ub.userId', userId);
  }

  getUserGenres(userId: string): Promise<UserGenreDto[]> {
    return Database.executeQuery<UserGenreDto>(
      GET_USER_GENRES,
      { userId },
      'UserRepository getUserGenres() GET_USER_GENRES Error: ',
    );
  }

  getUserTopCategories(userId: string): Promise<UserTopCategoryDto[]> {
    return Database.executeQuery<UserTopCategoryDto>(
      GET_USER_TOP_CATEGORIES,
      {
        userId,
      },
      'UserService getUserTopCategories() GET_USER_TOP_CATEGORIES Error: ',
    );
  }

  async getUserTopRecentTracks(
    userId: string,
    params: PaginationParams,
  ): Promise<SpotifyTrackModel[]> {
    return Database.executeQuery<SpotifyTrackModel>(
      GET_USER_TOP_RECENT_TRACKS,
      {
        userId,
        ...params,
      },
      'UserService getUserTopRecentTracks() GET_USER_TOP_RECENT_TRACKS Error: ',
    );
  }

  async getUserMostListenedArtists(
    userId: string,
    params: PaginationParams,
  ): Promise<ArtistModel[]> {
    return Database.executeQuery<ArtistModel>(
      GET_USER_MOST_LISTENED_ARTISTS,
      {
        userId,
        ...params,
      },
      'UserService getUserMostListenedArtists() GET_USER_MOST_LISTENED_ARTISTS Error: ',
    );
  }

  getUserByRestQuery(restQuery?: RestfulQuery) {
    const builder = AWSUsersModel.query()
      .alias('u')
      .joinRelated('profile as upi')
      .withGraphFetched('profile');

    joinSearchParamsToQueryBuilder(builder, restQuery);
    joinOrderParamsToQueryBuilder(builder, restQuery);
    joinPaginationParamsToQueryBuilder(builder, restQuery);

    return builder;
  }

  getUserByRestQueryCount(restQuery?: RestfulQuery) {
    const builder = AWSUsersModel.query().alias('u').joinRelated('profile as upi');

    joinSearchParamsToQueryBuilder(builder, restQuery);

    return builder.resultSize();
  }

  getUsersWithTotalCompletions() {
    return AWSUsersModel.query()
      .alias('u')
      .sum('bu.isComplete as userValue')
      .joinRelated(expr([Relations.BrackhitUser, 'bu']))
      .whereNot('u.staff', 1)
      .groupBy('u.sub');
  }

  getUsersWithTotalVotes() {
    return AWSUsersModel.query()
      .alias('u')
      .sum('b:bu.isComplete as userValue')
      .joinRelated(expr([Relations.Brackhit, 'b', [Relations.BrackhitUser, 'bu']]))
      .whereNot('u.staff', 1)
      .whereNot('u.sub', 'artistory')
      .groupBy('u.sub');
  }

  // do not remove, may be useful one day
  joinUserProfileToUsers(usersQB: QueryBuilder<AWSUsersModel, AWSUsersModel[]>) {
    usersQB
      .joinRelated(expr([Relations.Profile, 'upi']))
      .withGraphFetched(expr([Relations.Profile]), { joinOperation: JoinOperation.innerJoin })
      .modifyGraph(expr([Relations.Profile]), (builder) => {
        return builder.select('userId', 'username', 'firstName', 'lastName', 'userImage');
      });
  }

  castAwsUsersUserItems(
    usersQB: QueryBuilder<AWSUsersModel, AWSUsersModel[]>,
    categoryId: BrackhitCategory,
  ) {
    if (categoryId === BrackhitCategory.SuperFans) {
      usersQB.select(raw('4 as cardType'));
    } else {
      usersQB.select(raw('5 as cardType'));
    }

    return usersQB.castTo<UserItemDto[]>().execute();
  }

  filterTopAwsUsers(users: AWSUsersModel[]) {
    const userIds = users.map((u) => u.sub);

    return AWSUsersModel.query().whereIn('sub', userIds).orderByRaw('rand()');
  }

  filterFirstXTopUsers(usersQB: QueryBuilder<AWSUsersModel, AWSUsersModel[]>, take: number) {
    return usersQB.select('u.sub').orderByRaw('user_value desc').limit(take);
  }

  async getFeaturedUsers(params: TopUsersParamsDto): Promise<AWSUsersModel[]> {
    const [completionUsers, votesUsers] = await Promise.all([
      this.filterFirstXTopUsers(this.getUsersWithTotalCompletions(), params.completionUsersCount),
      this.filterFirstXTopUsers(this.getUsersWithTotalVotes(), params.voteUsersCount),
    ]);

    return completionUsers.concat(votesUsers);
  }

  getUserBrackhits(userId: string) {
    return BrackhitModel.query()
      .alias('b')
      .max('buc.choiceTime as lastChoiceTime')
      .join(
        BrackhitUserModel.getTableNameWithAlias(),
        BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId),
      )
      .leftJoin(
        BrackhitUserChoicesModel.getTableNameWithAlias(),
        BrackhitUserChoicesModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId),
      )
      .whereNot((builder) => {
        return builder.where('isComplete', 0).whereNotNull('initialCompleteTime');
      })
      .groupBy('b.brackhitId');
  }

  getUserCreatedBrackhits(userId: string) {
    return BrackhitModel.query().alias('b').where('b.ownerId', userId);
  }

  getBrackhitTracksTotalPicks(userId: string) {
    return BrackhitUserChoicesModel.query()
      .alias('buc')
      .min('st.id as id')
      .count('* as total')
      .joinRelated(expr([Relations.Track, 'st']))
      .join(
        BrackhitUserModel.getTableNameWithAlias(),
        BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnUserId('bu', 'buc'),
      )
      .where('buc.userId', userId)
      .where('bu.isComplete', 1)
      .groupBy('st.isrc');
  }

  getBrackhitArtistsPicks(userId: string) {
    const choicesCount = this.getBrackhitTracksTotalPicks(userId);

    return SpotifyArtistModel.query()
      .alias('sa')
      .select('sa.id')
      .sum('sub.total as total')
      .joinRelated(expr([Relations.Tracks, 'st']))
      .join(choicesCount.as('sub'), 'sub.id', 'st.id')
      .groupBy('sa.id');
  }

  getUserTopTracks(userId: string) {
    const choicesCount = this.getBrackhitTracksTotalPicks(userId);

    return SpotifyTrackModel.query().alias('st').join(choicesCount.as('sub'), 'sub.id', 'st.id');
  }

  getUserTopArtists(userId: string) {
    const topArtistsQB = this.getBrackhitArtistsPicks(userId);

    return SpotifyArtistModel.query()
      .alias('sa')
      .joinRelated(expr([Relations.Artist, 'a']))
      .join(topArtistsQB.as('sub'), 'sub.id', 'sa.id');
  }

  getUserTopChoices(userId: string) {
    const completedBrackhits = this.getUserCompletedBrackhits(userId);

    return BrackhitUserChoicesModel.query()
      .alias('buc')
      .joinRelated(expr([Relations.Brackhit, 'b', [Relations.Type, 'bt']]))
      .join(completedBrackhits.as('comp_b'), 'comp_b.brackhitId', 'buc.brackhitId')
      .where('buc.roundId', 15)
      .where('b.size', BrackhitSize._16)
      .where('buc.userId', userId);
  }

  getUserFriendRequests() {
    return UserFriendRequestsModel.query().alias('ufr').orderBy('ufr.timestamp', 'desc');
  }

  joinUserFriendRelationshipToUserProfile(
    usersQB: QueryBuilder<UserProfileInfoModel, UserProfileInfoModel[]>,
    userId: string,
    params: JoinParams,
  ) {
    usersQB
      .select(raw(UserFriendRequestsModel.rawSql.getUserFriendStatusOrderNumber(userId)))
      .leftJoin(this.getUserFriendRequests().as('out'), function () {
        this.onVal('out.userId', userId).andOn('out.userRequestedId', `${params.from}.userId`);
      })
      .leftJoin(this.getUserFriendRequests().as('in'), function () {
        this.on('in.userId', `${params.from}.userId`).andOnVal('in.userRequestedId', userId);
      });
  }

  saveArtistToUserFeed(userId: string, artistId: number) {
    return UserFeedPreferencesModel.query()
      .insertAndFetch({ userId, artistId })
      .onConflict()
      .ignore();
  }

  deleteArtistFromUserFeed(userId: string, artistId: number) {
    return UserFeedPreferencesModel.query().deleteById([artistId, userId]);
  }

  getUsersThatCompletedBrackhit(brackhitId: number) {
    return BrackhitUserModel.query().where({
      brackhitId,
      isComplete: BrackhitUserCompleteStatus.COMPLETED,
    });
  }

  deleteAwsUser(userId: string, trx?: Transaction) {
    return AWSUsersModel.query(trx).where({ sub: userId }).delete();
  }

  getUserSpotifyToken(userId: string) {
    return SpotifyUserTokensModel.query()
      .alias('sut')
      .from(
        raw(`(${GET_USER_SPOTIFY_TOKENS})`, { userId, hash: process.env.SPOTIFY_SECRET }).as('sut'),
      )
      .first();
  }

  // updateSpotifyAccessToken(userId: string, accessToken: string, expireTime: number) {
  //   return Database.executeQuery(UPDATE_SPOTIFY_USER_ACCESS_TOKEN, {
  //     userId,
  //     accessToken,
  //     expireTime,
  //     hash: process.env.SPOTIFY_SECRET,
  //   });
  // }

  updateSpotifyTokens(
    userId: string,
    accessToken: string,
    refreshToken: string,
    expireTime: number,
  ) {
    return Database.executeQuery(UPDATE_SPOTIFY_USER_TOKENS, {
      userId,
      accessToken,
      refreshToken,
      expireTime,
      hash: process.env.SPOTIFY_SECRET,
    });
  }

  updateUserTokenSpotifyId(userId: string, spotifyUserId: string) {
    return SpotifyUserTokensModel.query().updateAndFetchById(userId, { spotifyUserId });
  }

  getUserLastCompletedBrackhit(userId: string) {
    return BrackhitModel.query()
      .alias('b')
      .join(
        BrackhitUserModel.getTableNameWithAlias('bu'),
        BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId),
      )
      .where('bu.isComplete', 1)
      .orderBy('bu.updatedAt', 'desc')
      .first();
  }

  getUserCompletedBrackhits(userId: string) {
    return this.brackhitRepo.getCompletedUserBrackhits().where('bu.userId', userId);
  }

  getUserNotCompletedBrackhits(userId: string) {
    return BrackhitModel.query()
      .alias('b')
      .leftJoin(
        BrackhitUserModel.getTableNameWithAlias('bu'),
        BrackhitUserModel.callbacks.joinOnBrackhitIdAndOnValUserId(userId, {
          from: 'b',
          to: 'bu',
        }),
      )
      .where(BrackhitUserModel.callbacks.whereIsCompleteZeroOrNull('bu'));
  }

  getSharedBrackhits(firstUserId: string, secondUserId: string) {
    const firstBrackhitsQB = this.getUserCompletedBrackhits(firstUserId);
    const secondBrackhitsQB = this.getUserCompletedBrackhits(secondUserId);

    return BrackhitModel.query()
      .alias('b')
      .join(firstBrackhitsQB.as('sub1'), 'sub1.brackhitId', 'b.brackhitId')
      .join(secondBrackhitsQB.as('sub2'), 'sub2.brackhitId', 'b.brackhitId');
  }

  getUserBrackhit(brackhitId: number, userId: string) {
    return BrackhitUserModel.query().findById([userId, brackhitId]);
  }

  getBrackhitChoices(brackhitId: number, userId: string) {
    return BrackhitUserChoicesModel.query()
      .alias('buc')
      .where('buc.brackhitId', brackhitId)
      .where('buc.userId', userId);
  }

  getUserDevices(userId: string) {
    return UserDevicesModel.query().alias('ud').where('ud.userId', userId);
  }

  getUserAppVersions(userId: string) {
    return UserAppVersionModel.query().alias('uav').where('uav.userId', userId);
  }

  getUserFeedPreferences(userId: string) {
    return UserFeedPreferencesModel.query().alias('ufp').where('ufp.userId', userId);
  }

  getUserRecommendedArtists(userId: string) {
    const recommendedArtists = this.getUserFeedPreferences(userId)
      .select('sa:sra:sa2.artistId', raw('sum(1 / `sa:sra`.`position`) as position'))
      .joinRelated(
        expr([
          Relations.SpotifyArtist,
          'sa',
          [Relations.SpotifyRelatedArtists, 'sra', [Relations.RelatedSpotifyArtist, 'sa2']],
        ]),
      )
      .leftJoin(UserFeedPreferencesModel.getTableNameWithAlias('ufp2'), function () {
        this.on('ufp2.artistId', 'sa:sra:sa2.artistId').andOn('ufp2.userId', 'ufp.userId');
      })
      .whereNotNull('sa:sra:sa2.artistId')
      .whereNull('ufp2.artistId')
      .groupBy('sa:sra:sa2.artistId');

    return ArtistModel.query()
      .alias('a')
      .join(recommendedArtists.as('rec'), 'a.id', 'rec.artistId');
  }

  getUserLikedContent(userId: string) {
    return LogContentModel.query()
      .where({ userId, interactionId: InteractionTypes.Like })
      .withGraphFetched(expr([Relations.CentralFeed, [Relations.FeedSource]]))
      .orderBy('timestamp', 'desc');
  }

  getUserLocation(data: Partial<UserLocationModel>) {
    return UserLocationModel.query().findOne(data);
  }

  insertUserLocation(data: Partial<UserLocationModel>) {
    return UserLocationModel.query().insertAndFetch(data);
  }

  getUserSearchRadius(data: Partial<UserSearchRadiusModel>) {
    return UserSearchRadiusModel.query().findOne(data);
  }

  insertUserSearchRadius(data: Partial<UserSearchRadiusModel>) {
    return UserSearchRadiusModel.query().insertAndFetch(data);
  }
}
