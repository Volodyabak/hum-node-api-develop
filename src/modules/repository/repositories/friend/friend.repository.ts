import { Injectable } from '@nestjs/common';
import {
  ArtistModel,
  BadgesModel,
  UserBadgesModel,
  UserFriendCompatabilityModel,
  UserFriendRequestsModel,
  UserFriendsModel,
} from '../../../../../database/Models';
import { PartialModelObject } from 'objection';
import { COMPARE_FRIENDS_GENRES_TAKE, FriendRequestStatus } from '../../../friends/constants';
import {
  DiscoveredFriendCategory,
  FriendComparedGenreDto,
  UserFriendDiscoveredTrackDto,
  UserFriendSharedArtistDto,
  UserFriendSharedTrackDto,
} from '../../../friends/dto/friends.dto';
import { Database } from '../../../../../database/database';
import {
  COMPARE_BADGES,
  COMPARE_FRIEND_GENRES,
  COMPARE_SHARED_ARTISTS,
  COMPARE_SHARED_TRACKS,
  DISCOVER_FRIEND_ARTISTS,
  DISCOVER_FRIEND_CATEGORIES,
  DISCOVER_FRIEND_TRACKS,
  DISCOVER_FRIEND_TRENDING,
} from '../../../friends/queries/friends.queries';
import { ConstantsModel } from '../../../../../database/Models/ConstantsModel';
import { ConstantId } from '../../../constants/constants';

@Injectable()
export class FriendRepository {
  getUserFriendRequest(userId: string, userRequestedId: string) {
    return UserFriendRequestsModel.query()
      .alias('ufr')
      .where('ufr.userId', userId)
      .where('ufr.userRequestedId', userRequestedId)
      .orderBy('timestamp', 'desc')
      .first();
  }

  createFriendRequest(data: PartialModelObject<UserFriendRequestsModel>) {
    return UserFriendRequestsModel.query().insert(data);
  }

  acceptFriendRequest(data: PartialModelObject<UserFriendRequestsModel>) {
    return UserFriendRequestsModel.query()
      .where({
        ...data,
        status: FriendRequestStatus.PENDING,
      })
      .update({ status: FriendRequestStatus.ACCEPTED });
  }

  addOneSignalIdToFriendRequest(
    oneSignalId: string,
    data: PartialModelObject<UserFriendRequestsModel>,
  ) {
    return UserFriendRequestsModel.query()
      .where({
        ...data,
      })
      .update({ oneSignalId });
  }

  getUserFriend(data: PartialModelObject<UserFriendsModel>) {
    return UserFriendsModel.query().findOne(data);
  }

  addUserFriend(data: PartialModelObject<UserFriendsModel>) {
    return UserFriendsModel.query().insertAndFetch(data);
  }

  rejectFriendRequest(data: PartialModelObject<UserFriendRequestsModel>) {
    return UserFriendRequestsModel.query()
      .where({
        ...data,
        status: FriendRequestStatus.PENDING,
      })
      .update({ status: FriendRequestStatus.DENIED });
  }

  deleteUserFriend(data: PartialModelObject<UserFriendsModel>) {
    return UserFriendsModel.query().where(data).delete();
  }

  deleteUserFriendCompatability(data: PartialModelObject<UserFriendCompatabilityModel>) {
    return UserFriendCompatabilityModel.query().where(data).delete();
  }

  deleteUserFriendRequests(data: PartialModelObject<UserFriendRequestsModel>) {
    return UserFriendRequestsModel.query().where(data).delete();
  }

  getUserFriendComparedGenres(
    data: PartialModelObject<UserFriendsModel>,
  ): Promise<FriendComparedGenreDto[]> {
    return Database.executeQuery<FriendComparedGenreDto>(
      COMPARE_FRIEND_GENRES,
      {
        ...data,
        take: COMPARE_FRIENDS_GENRES_TAKE,
      },
      'FriendsRepository compareFriendGenres() COMPARE_FRIEND_GENRES Error: ',
    );
  }

  getUserFriendComparedBadges(data: PartialModelObject<UserBadgesModel>): Promise<BadgesModel[]> {
    return Database.executeQuery<BadgesModel>(
      COMPARE_BADGES,
      {
        ...data,
      },
      'FriendsRepository getUserBadges() COMPARE_BADGES Error: ',
    );
  }

  async getUserFriendSharedArtists(
    data: PartialModelObject<UserFriendsModel>,
  ): Promise<UserFriendSharedArtistDto[]> {
    const constant = await ConstantsModel.query().findById(ConstantId.FRIENDS_SHARED_ARTISTS_COUNT);
    return Database.executeQuery<UserFriendSharedArtistDto>(
      COMPARE_SHARED_ARTISTS,
      {
        ...data,
        take: constant.value,
      },
      'FriendsRepository getUserFriendSharedArtists() COMPARE_SHARED_ARTISTS Error',
    );
  }

  async getUserFriendSharedTracks(
    data: PartialModelObject<UserFriendsModel>,
  ): Promise<UserFriendSharedTrackDto[]> {
    const constant = await ConstantsModel.query().findById(ConstantId.FRIENDS_SHARED_TRACKS_COUNT);
    return Database.executeQuery<UserFriendSharedTrackDto>(
      COMPARE_SHARED_TRACKS,
      {
        ...data,
        take: constant.value,
      },
      'FriendsRepository getUserFriendSharedTracks() COMPARE_SHARED_TRACKS Error',
    );
  }

  getUserFriendCompatibility(data: PartialModelObject<UserFriendCompatabilityModel>) {
    return UserFriendCompatabilityModel.query().where(data).first();
  }

  discoverFriendArtists(userId: string, friendId: string): Promise<ArtistModel[]> {
    return Database.executeQuery<ArtistModel>(
      DISCOVER_FRIEND_ARTISTS,
      {
        userId,
        friendId,
      },
      'FriendsRepository discoverFriendArtists() DISCOVER_FRIEND_ARTISTS Error: ',
    );
  }

  discoverFriendTrending(userId: string, friendId: string): Promise<ArtistModel[]> {
    return Database.executeQuery<ArtistModel>(
      DISCOVER_FRIEND_TRENDING,
      {
        userId,
        friendId,
      },
      'FriendsRepository discoverFriendTrending() DISCOVER_FRIEND_TRENDING Error: ',
    );
  }

  discoverFriendTracks(userId: string, friendId: string): Promise<UserFriendDiscoveredTrackDto[]> {
    console.log('1');
    return Database.executeQuery<UserFriendDiscoveredTrackDto>(
      DISCOVER_FRIEND_TRACKS,
      {
        userId,
        friendId,
      },
      'FriendsRepository discoverFriendTracks() DISCOVER_FRIEND_TRACKS Error: ',
    );
  }

  discoverFriendCategories(userId: string, friendId: string): Promise<DiscoveredFriendCategory[]> {
    return Database.executeQuery<DiscoveredFriendCategory>(
      DISCOVER_FRIEND_CATEGORIES,
      {
        userId,
        friendId,
      },
      'FriendsRepository discoverFriendCategories() DISCOVER_FRIEND_CATEGORIES Error: ',
    );
  }

  getUserPendingFriendRequests(userId: string) {
    return this.getPendingFriendRequests().where('ufr.userRequestedId', userId);
  }

  getPendingFriendRequests() {
    return UserFriendRequestsModel.query()
      .alias('ufr')
      .where('ufr.status', FriendRequestStatus.PENDING);
  }
}
