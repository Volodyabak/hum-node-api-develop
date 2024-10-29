import Tools from '../../Tools';
import {
  GET_USER_ARTISTS,
  GET_USER_BADGES,
  GET_USER_FRIENDS,
  GET_USER_FRIENDS_WITH_COMPATABILITY,
  GET_USER_GAME_HISTORY,
  GET_USER_GENRES,
  GET_USER_MOST_LISTENED_ARTISTS,
  GET_USER_PROFILE,
  GET_USER_TOP_RECENT_TRACKS,
  GET_USERTOPARTISTS,
} from '../../Queries';
import { ArtistService } from '../Artist/ArtistService';
import { TrackService } from '../Track/TrackService';
import { BrackhitUtils } from '../Brackhits/BrackhitUtils';
import { db } from '../../../database/knex';
import {
  AWSUsersModel,
  UserAppVersionModel,
  UserDevicesModel,
  UserFtueModel,
  UserProfileInfoModel,
} from '../../../database/Models';
import { AppSettingsService } from '../AppSettings/AppSettingsService';
import { SpotifyUserTokensModel } from '../../../database/Models/Spotify/SpotifyUserTokensModel';
import { DEFAULT_USER_IMAGE } from '../../constants';
import { expr } from '../../../database/relations/relation-builder';
import { Relations } from '../../../database/relations/relations';
import { AppleUserTokensModel } from '../../../database/Models/apple/apple-user-tokens.model';
import { StreamingService } from '../../modules/spotify/constants';

class UserService {
  private brackhitUtils: BrackhitUtils;

  constructor() {
    this.brackhitUtils = new BrackhitUtils();
  }

  async getUser(userId) {
    return (await Tools.promisifiedQuery(GET_USER_PROFILE, { userId }))[0] || null;
  }

  async getUserProfileByUsername(username) {
    return UserProfileInfoModel.query().findOne({ username });
  }

  async insertNewUser({ name, email, sub }) {
    const trx = await UserProfileInfoModel.startTransaction();
    const [firstName, lastName] = name.split(' ');
    const username = await this.getUniqueUsername();

    try {
      const awsUser = await AWSUsersModel.query(trx).insertAndFetch({
        name,
        email,
        sub,
        username,
      });
      const profile = await UserProfileInfoModel.query(trx).insertAndFetch({
        userImage: DEFAULT_USER_IMAGE,
        userId: sub,
        firstName,
        lastName,
        username,
      });

      await trx.commit();
      return {
        awsUser,
        profile,
      };
    } catch (err) {
      await trx.rollback();
      throw err;
    }
  }

  async getUserByEmail(email) {
    return AWSUsersModel.query().findOne({ email });
  }

  async getUserProfile(userId) {
    const profile = await UserProfileInfoModel.query()
      .alias('upi')
      .select('upi.*', 'ui.typeId as influencerType')
      .leftJoinRelated(expr([Relations.UserInfluencer, 'ui']))
      .findOne('upi.userId', userId);

    if (profile) {
      profile.profileComplete = profile.createdAt.toISOString() !== profile.updatedAt.toISOString();
    }

    return profile || null;
  }

  async updateProfile(userId, profile) {
    return UserProfileInfoModel.query().patchAndFetchById(userId, profile);
  }

  async getUserBrackhit(userId, brackhitId) {
    return db('labl.brackhit_user')
      .where({
        user_id: userId,
        brackhit_id: brackhitId,
      })
      .first();
  }

  async getSignedUserProfile(userId) {
    return this.getUserProfile(userId);
  }

  async getUserFriendRequest(userId, userRequestedId) {
    return db('labl.user_friend_requests')
      .where({
        user_id: userId,
        user_requested_id: userRequestedId,
      })
      .orderBy('timestamp', 'DESC')
      .first();
  }

  async getUserFriends(
    userId,
    withCompatability = false,
    skip = 0,
    take = Number.MAX_SAFE_INTEGER,
  ) {
    if (withCompatability) {
      return Tools.promisifiedQuery(
        GET_USER_FRIENDS_WITH_COMPATABILITY,
        {
          userId,
          skip,
          take,
        },
        'User Service getUserFriends() GET_USER_FRIENDS_WITH_COMPATABILITY Error: ',
      );
    } else {
      return Tools.promisifiedQuery(
        GET_USER_FRIENDS,
        {
          userId,
          skip,
          take,
        },
        'User Service getUserFriends() GET_USER_FRIENDS Error: ',
      );
    }
  }

  async getUserDevices(userId: string) {
    return UserDevicesModel.query().where({ userId });
  }

  async getFullUserProfile(userId) {
    const [user, profile, userFriends] = await Promise.all([
      this.getUser(userId),
      this.getUserProfile(userId),
      this.getUserFriends(userId),
    ]);
    if (!user) {
      throw new Error('User Service getFullUserProfile() Error: user not found');
    }
    return {
      ...profile,
      joinDate: user.joinDate,
      followedArtistsCount: user.followedArtistsCount,
      friendsCount: userFriends.length,
    };
  }

  async getUserMostListenedArtists(userId: string, take: number = 5) {
    const mostListenedArtists = await Tools.promisifiedQuery(
      GET_USER_MOST_LISTENED_ARTISTS,
      {
        userId,
        take,
      },
      'User Service getUserMostListenedArtists() Error: ',
    );

    return Promise.all(
      mostListenedArtists.map((artist) => {
        return ArtistService.getArtistProfile(artist.artistId).then((profile) => ({
          ...profile,
          rank: artist.rank,
        }));
      }),
    );
  }

  async getUserTopRecentTracks(userId: string, take: number = 5) {
    const recentTracks = await Tools.promisifiedQuery(
      GET_USER_TOP_RECENT_TRACKS,
      {
        userId,
        take,
      },
      'User Service getUserTopRecentTracks() GET_USER_TOP_RECENT_TRACKS Error: ',
    );
    const settings = await AppSettingsService.getAppSettingsState();

    return Promise.all(
      recentTracks.map((track) => {
        return TrackService.getTrackInfo(track.id, settings).then((trackInfo) => ({
          ...trackInfo,
          ranking: track.rank,
        }));
      }),
    );
  }

  async getUserTopArtists(userId) {
    return Tools.promisifiedQuery(
      GET_USERTOPARTISTS,
      { user: userId },
      'User Service getUserTopArtists() Error: ',
    );
  }

  async getUserGamingData(userId) {
    const gameHistory = await Tools.promisifiedQuery(
      GET_USER_GAME_HISTORY,
      { userId },
      'Profile Service getUserGamingData() Error: ',
    );
    gameHistory.forEach((el) => {
      el.score = el.round_number * el.number_questions - (6 - el.question_number);
    });
    const scores = gameHistory.map((game) => game.score);
    const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const perfectScores = scores.reduce((prev, curr) => (curr === 36 ? ++prev : prev), 0);
    const highestScore = Math.max(...scores);

    return {
      recentGames: gameHistory.slice(0, 5),
      averageScore,
      perfectScores,
      allTime: highestScore,
    };
  }

  async getUserBadges(userId) {
    return Tools.promisifiedQuery(
      GET_USER_BADGES,
      { user_id: userId },
      'Profile Service getUserBadges() Error: ',
    );
  }

  async getUserGenres(userId) {
    const genres = await Tools.promisifiedQuery(
      GET_USER_GENRES,
      { userId },
      'UserService getUserGenres() GET_USER_GENRES Error: ',
    );
    const genresPercentage = genres.reduce((prev, curr) => prev + curr.p, 0);

    genres.push({
      genre_name: 'Other',
      p: 1 - genresPercentage,
    });

    return genres;
  }

  async getUserArtists(userId) {
    const userArtists = await Tools.promisifiedQuery(
      GET_USER_ARTISTS,
      { userId },
      'Profile Service getMusicProfile() Error: ',
    );

    return {
      userId,
      artistIds: userArtists.map((elem) => elem.artistId),
    };
  }

  async getUserTotalXP(userId) {
    const data = await db('labl.transactions_xp')
      .sum('value as xp')
      .where({ user_id: userId })
      .first();
    return data.xp;
  }

  async createFtue(userId, genreId, tagId) {
    return UserFtueModel.query()
      .insertAndFetch({
        userId,
        genreId,
        tagId,
      })
      .onConflict()
      .merge();
  }

  async getUserAccountStreamingType(user_id) {
    let streaming = null;
    const [spotifyToken, appleToken] = await Promise.all([
      SpotifyUserTokensModel.query().findOne({ user_id }),
      AppleUserTokensModel.query().findOne({ user_id }),
    ]);

    if (spotifyToken) {
      streaming = spotifyToken.accountType;
    } else if (appleToken) {
      streaming = StreamingService.APPLE_MUSIC;
    }

    return streaming;
  }

  async deleteUser(userId) {
    return AWSUsersModel.query().delete().where({ sub: userId });
  }

  async getUniqueUsername() {
    let user, profile, username;

    do {
      username = Tools.generateUniqueUsername();
      [user, profile] = await Promise.all([
        this.getAwsUserByUsername(username),
        this.getUserProfileByUsername(username),
      ]);
    } while (user !== undefined && profile !== undefined);

    return username;
  }

  async getAwsUserByUsername(username: string) {
    return AWSUsersModel.query().alias('u').where('u.username', username).first();
  }

  async getUserAppVersion(userId: string): Promise<UserAppVersionModel> {
    return UserAppVersionModel.query()
      .alias('uav')
      .where('uav.userId', userId)
      .orderBy('uav.timestamp', 'desc')
      .first();
  }

  async insertUserAppVersion(userId: string, appVersion: string): Promise<UserAppVersionModel> {
    return UserAppVersionModel.query()
      .insertAndFetch({
        userId,
        appVersion,
      })
      .onConflict()
      .ignore();
  }
}

const instance = new UserService();
export { instance as UserService };
