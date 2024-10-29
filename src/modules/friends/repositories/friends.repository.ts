// import {
//   COMPARE_BADGES,
//   COMPARE_FRIEND_GENRES,
//   COMPARE_SHARED_ARTISTS,
//   COMPARE_SHARED_TRACKS,
//   DISCOVER_FRIEND_ARTISTS,
//   DISCOVER_FRIEND_CATEGORIES,
//   DISCOVER_FRIEND_TRACKS,
//   DISCOVER_FRIEND_TRENDING,
// } from '../../../Queries';
// import {
//   COMPARE_FRIENDS_GENRES_TAKE,
//   COMPARE_FRIENDS_SHARED_ARTISTS_TAKE,
//   COMPARE_FRIENDS_SHARED_TRACKS_TAKE,
//   FriendRequestStatus,
// } from '../constants';
// import {
//   DiscoveredFriendCategory,
//   FriendComparedGenreDto,
//   UserFriendDiscoveredTrackDto,
//   UserFriendSharedArtistDto,
//   UserFriendSharedTrackDto,
// } from '../dto/friends.dto';
// import { Injectable } from '@nestjs/common';
// import { PartialModelObject } from 'objection';
// import { Database } from '../../../../database/database';
// import {
//   ArtistModel,
//   BadgesModel,
//   UserBadgesModel,
//   UserFriendCompatabilityModel,
//   UserFriendRequestsModel,
//   UserFriendsModel,
// } from '../../../../database/Models';
//
// @Injectable()
// export class FriendsRepository {
//   getUserFriendRequestQB(userId: string, userRequestedId: string) {
//     return UserFriendRequestsModel.query()
//       .alias('ufr')
//       .where('ufr.userId', userId)
//       .where('ufr.userRequestedId', userRequestedId)
//       .orderBy('timestamp', 'desc')
//       .first();
//   }
//
//   createFriendRequest(data: PartialModelObject<UserFriendRequestsModel>) {
//     return UserFriendRequestsModel.query().insert(data);
//   }
//
//   acceptFriendRequest(data: PartialModelObject<UserFriendRequestsModel>) {
//     return UserFriendRequestsModel.query()
//       .where({
//         ...data,
//         status: FriendRequestStatus.PENDING,
//       })
//       .update({ status: FriendRequestStatus.ACCEPTED });
//   }
//
//   getUserFriend(data: PartialModelObject<UserFriendsModel>) {
//     return UserFriendsModel.query().findOne(data);
//   }
//
//   addUserFriend(data: PartialModelObject<UserFriendsModel>) {
//     return UserFriendsModel.query().insertAndFetch(data);
//   }
//
//   rejectFriendRequest(data: PartialModelObject<UserFriendRequestsModel>) {
//     return UserFriendRequestsModel.query()
//       .where({
//         ...data,
//         status: FriendRequestStatus.PENDING,
//       })
//       .update({ status: FriendRequestStatus.DENIED });
//   }
//
//   deleteUserFriend(data: PartialModelObject<UserFriendsModel>) {
//     return UserFriendsModel.query().where(data).delete();
//   }
//
//   deleteUserFriendCompatability(data: PartialModelObject<UserFriendCompatabilityModel>) {
//     return UserFriendCompatabilityModel.query().where(data).delete();
//   }
//
//   deleteUserFriendRequests(data: PartialModelObject<UserFriendRequestsModel>) {
//     return UserFriendRequestsModel.query().where(data).delete();
//   }
//
//   getUserFriendComparedGenres(
//     data: PartialModelObject<UserFriendsModel>,
//   ): Promise<FriendComparedGenreDto[]> {
//     return Database.executeQuery<FriendComparedGenreDto>(
//       COMPARE_FRIEND_GENRES,
//       {
//         ...data,
//         take: COMPARE_FRIENDS_GENRES_TAKE,
//       },
//       'FriendsRepository compareFriendGenres() COMPARE_FRIEND_GENRES Error: ',
//     );
//   }
//
//   getUserFriendComparedBadges(data: PartialModelObject<UserBadgesModel>): Promise<BadgesModel[]> {
//     return Database.executeQuery<BadgesModel>(
//       COMPARE_BADGES,
//       {
//         ...data,
//       },
//       'FriendsRepository getUserBadges() COMPARE_BADGES Error: ',
//     );
//   }
//
//   getUserFriendSharedArtists(
//     data: PartialModelObject<UserFriendsModel>,
//   ): Promise<UserFriendSharedArtistDto[]> {
//     return Database.executeQuery<UserFriendSharedArtistDto>(
//       COMPARE_SHARED_ARTISTS,
//       {
//         ...data,
//         take: COMPARE_FRIENDS_SHARED_ARTISTS_TAKE,
//       },
//       'FriendsRepository getUserFriendSharedArtists() COMPARE_SHARED_ARTISTS Error',
//     );
//   }
//
//   getUserFriendSharedTracks(
//     data: PartialModelObject<UserFriendsModel>,
//   ): Promise<UserFriendSharedTrackDto[]> {
//     return Database.executeQuery<UserFriendSharedTrackDto>(
//       COMPARE_SHARED_TRACKS,
//       {
//         ...data,
//         take: COMPARE_FRIENDS_SHARED_TRACKS_TAKE,
//       },
//       'FriendsRepository getUserFriendSharedTracks() COMPARE_SHARED_TRACKS Error',
//     );
//   }
//
//   getUserFriendCompatibility(data: PartialModelObject<UserFriendCompatabilityModel>) {
//     return UserFriendCompatabilityModel.query().where(data).first();
//   }
//
//   discoverFriendArtists(userId: string, friendId: string): Promise<ArtistModel[]> {
//     return Database.executeQuery<ArtistModel>(
//       DISCOVER_FRIEND_ARTISTS,
//       {
//         userId,
//         friendId,
//       },
//       'FriendsRepository discoverFriendArtists() DISCOVER_FRIEND_ARTISTS Error: ',
//     );
//   }
//
//   discoverFriendTrending(userId: string, friendId: string): Promise<ArtistModel[]> {
//     return Database.executeQuery<ArtistModel>(
//       DISCOVER_FRIEND_TRENDING,
//       {
//         userId,
//         friendId,
//       },
//       'FriendsRepository discoverFriendTrending() DISCOVER_FRIEND_TRENDING Error: ',
//     );
//   }
//
//   discoverFriendTracks(userId: string, friendId: string): Promise<UserFriendDiscoveredTrackDto[]> {
//     return Database.executeQuery<UserFriendDiscoveredTrackDto>(
//       DISCOVER_FRIEND_TRACKS,
//       {
//         userId,
//         friendId,
//       },
//       'FriendsRepository discoverFriendTracks() DISCOVER_FRIEND_TRACKS Error: ',
//     );
//   }
//
//   discoverFriendCategories(userId: string, friendId: string): Promise<DiscoveredFriendCategory[]> {
//     return Database.executeQuery<DiscoveredFriendCategory>(
//       DISCOVER_FRIEND_CATEGORIES,
//       {
//         userId,
//         friendId,
//       },
//       'FriendsRepository discoverFriendCategories() DISCOVER_FRIEND_CATEGORIES Error: ',
//     );
//   }
// }
