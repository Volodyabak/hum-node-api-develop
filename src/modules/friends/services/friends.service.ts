import { Injectable } from '@nestjs/common';
import { FriendRequestStatus, UserRelationship } from '../constants';
import {
  UserFriendCompatabilityModel,
  UserFriendRequestsModel,
  UserFriendsModel,
} from '../../../../database/Models';
import {
  ComparedBadgesDto,
  DiscoveredFriendCategory,
  FriendComparedGenreDto,
  UserFriendSharedArtistsResponseDto,
  UserFriendSharedTrackResponseDto,
} from '../dto/friends.dto';
import { ErrorConst } from '../../../Errors/ErrorConst';
import { BadRequestError } from '../../../Errors';
import { ArtistService } from '../../../Services/Artist/ArtistService';
import { TrackService } from '../../../Services/Track/TrackService';
import { AppSettingsService } from '../../../Services/AppSettings/AppSettingsService';
import { ArtistProfileDto } from '../../artists/dto/artists.dto';
import { DiscoveredTrackDto } from '../../users/dto/users.dto';
import { RepositoryService } from '../../repository/services/repository.service';

@Injectable()
export class FriendsService {
  constructor(private readonly repositoryService: RepositoryService) {}

  async checkFriendIncomingPendingRequest(userId: string, userRequestedId: string): Promise<void> {
    const friendRequest = await this.getUserFriendRequest(userRequestedId, userId);

    if (!friendRequest) {
      throw new BadRequestError(ErrorConst.FRIEND_REQUEST_NOT_SENT);
    }

    if (friendRequest.status !== FriendRequestStatus.PENDING) {
      throw new BadRequestError(ErrorConst.NO_PENDING_REQUESTS);
    }
  }

  async getUserFriendRequest(
    userId: string,
    userRequestedId: string,
  ): Promise<UserFriendRequestsModel> {
    return this.repositoryService.friendRepo.getUserFriendRequest(userId, userRequestedId);
  }

  async createFriendRequest(userId: string, userRequestedId: string) {
    return this.repositoryService.friendRepo.createFriendRequest({
      userId,
      userRequestedId,
      status: FriendRequestStatus.PENDING,
    });
  }

  async acceptFriendRequest(userId: string, userRequestedId: string): Promise<number> {
    return this.repositoryService.friendRepo.acceptFriendRequest({ userId, userRequestedId });
  }

  async getUserFriend(userId: string, friendId: string): Promise<UserFriendsModel> {
    return this.repositoryService.friendRepo.getUserFriend({ userId, friendId });
  }

  async addUserFriend(userId: string, friendId: string): Promise<UserFriendsModel> {
    return this.repositoryService.friendRepo.addUserFriend({ userId, friendId });
  }

  async rejectFriendRequest(userId: string, userRequestedId: string): Promise<number> {
    return this.repositoryService.friendRepo.rejectFriendRequest({ userId, userRequestedId });
  }

  async getUserFriendStatus(userId: string, friendId: string): Promise<UserRelationship> {
    if (userId === friendId) {
      return UserRelationship.SELF;
    }

    const [outgoingFriendRequest, incomingFriendRequest] = await Promise.all([
      this.getUserFriendRequest(userId, friendId),
      this.getUserFriendRequest(friendId, userId),
    ]);

    if (
      incomingFriendRequest?.status === FriendRequestStatus.ACCEPTED ||
      outgoingFriendRequest?.status === FriendRequestStatus.ACCEPTED
    ) {
      return UserRelationship.FRIEND;
    }

    if (incomingFriendRequest?.status === FriendRequestStatus.PENDING) {
      return UserRelationship.RESPOND;
    }

    if (outgoingFriendRequest?.status === FriendRequestStatus.PENDING) {
      return UserRelationship.REQUESTED;
    }

    return UserRelationship.NONE;
  }

  async deleteUserFriend(userId: string, friendId: string): Promise<number> {
    return this.repositoryService.friendRepo.deleteUserFriend({ userId, friendId });
  }

  async deleteUserFriendCompatability(userId: string, friendId: string): Promise<number> {
    return this.repositoryService.friendRepo.deleteUserFriendCompatability({
      userId,
      friendId,
    });
  }

  async deleteUserFriendRequests(userId: string, userRequestedId: string): Promise<number> {
    return this.repositoryService.friendRepo.deleteUserFriendRequests({
      userId,
      userRequestedId,
    });
  }

  async getUserFriendComparedGenres(
    userId: string,
    friendId: string,
  ): Promise<FriendComparedGenreDto[]> {
    return this.repositoryService.friendRepo.getUserFriendComparedGenres({
      userId,
      friendId,
    });
  }

  async getUserFriendComparedBadges(userId: string, friendId: string): Promise<ComparedBadgesDto> {
    const badges = await this.repositoryService.friendRepo.getUserFriendComparedBadges({
      userId,
      friendId,
    });

    return {
      shared: badges
        .filter((el) => el.section === 'shared')
        .map(({ badgeId, badge }) => ({
          badgeId,
          badge,
        })),
      user: badges
        .filter((el) => el.section === 'user')
        .map(({ badgeId, badge }) => ({
          badgeId,
          badge,
        })),
      friend: badges
        .filter((el) => el.section === 'friend')
        .map(({ badgeId, badge }) => ({
          badgeId,
          badge,
        })),
    };
  }

  async getUserFriendSharedArtists(
    userId: string,
    friendId: string,
  ): Promise<UserFriendSharedArtistsResponseDto[]> {
    const artists = await this.repositoryService.friendRepo.getUserFriendSharedArtists({
      userId,
      friendId,
    });

    return Promise.all(
      artists.map((artist) => {
        return ArtistService.getArtistProfile(artist.artistId).then((profile) => ({
          ...profile,
          userRank: artist.userRank,
          friendRank: artist.friendRank,
        }));
      }),
    );
  }

  async getUserFriendSharedTracks(
    userId: string,
    friendId: string,
  ): Promise<UserFriendSharedTrackResponseDto[]> {
    const sharedTracks = await this.repositoryService.friendRepo.getUserFriendSharedTracks({
      userId,
      friendId,
    });

    const settings = await AppSettingsService.getAppSettingsState();

    return Promise.all(
      sharedTracks.map(async (track) => {
        return TrackService.getTrackInfo(track.id, settings).then((info) => ({
          ...info,
          userRank: track.userRank,
          friendRank: track.friendRank,
        }));
      }),
    );
  }

  async checkIfUsersAreFriends(userId: string, friendId: string) {
    const userFriend = await this.getUserFriend(userId, friendId);
    if (!userFriend) {
      throw new BadRequestError(ErrorConst.USERS_ARE_NOT_FRIENDS);
    }
  }

  async checkIfUsersAreNotFriends(userId: string, friendId: string) {
    const userFriend = await this.getUserFriend(userId, friendId);
    if (userFriend) {
      throw new BadRequestError(ErrorConst.USERS_ARE_ALREADY_FRIENDS);
    }
  }

  async checkFriendOutgoingPendingRequest(userId: string, userRequestedId: string): Promise<void> {
    if (userId === userRequestedId) {
      throw new BadRequestError(ErrorConst.FRIEND_REQUEST_TO_HIMSELF);
    }

    const [outgoingFriendRequest, incomingFriendRequest] = await Promise.all([
      this.getUserFriendRequest(userId, userRequestedId),
      this.getUserFriendRequest(userRequestedId, userId),
    ]);

    if (outgoingFriendRequest?.status === FriendRequestStatus.PENDING) {
      throw new BadRequestError(ErrorConst.ALREADY_SENT_REQUEST);
    }
    if (incomingFriendRequest?.status === FriendRequestStatus.PENDING) {
      throw new BadRequestError(ErrorConst.PENDING_INCOMING_REQUEST);
    }
    if (
      outgoingFriendRequest?.status === FriendRequestStatus.ACCEPTED ||
      incomingFriendRequest?.status === FriendRequestStatus.ACCEPTED
    ) {
      throw new BadRequestError(ErrorConst.ALREADY_ACCEPTED_REQUEST);
    }
  }

  async getUserFriendCompatibility(
    userId: string,
    friendId: string,
  ): Promise<UserFriendCompatabilityModel> {
    return this.repositoryService.friendRepo.getUserFriendCompatibility({ userId, friendId });
  }

  async discoverFriendArtists(userId: string, friendId: string): Promise<ArtistProfileDto[]> {
    const artists = await this.repositoryService.friendRepo.discoverFriendArtists(userId, friendId);
    return Promise.all(artists.map(async (el) => ArtistService.getArtistProfile(el.artistId)));
  }

  async discoverFriendTrending(userId: string, friendId: string): Promise<ArtistProfileDto[]> {
    const artists = await this.repositoryService.friendRepo.discoverFriendTrending(
      userId,
      friendId,
    );
    return Promise.all(artists.map(async (el) => ArtistService.getArtistProfile(el.artistId)));
  }

  async discoverFriendTracks(userId: string, friendId: string): Promise<DiscoveredTrackDto[]> {
    const tracks = await this.repositoryService.friendRepo.discoverFriendTracks(userId, friendId);
    const settings = await AppSettingsService.getAppSettingsState();

    return Promise.all(
      tracks.map((track) => {
        return TrackService.getTrackInfo(track.id, settings).then((info) => ({
          ...info,
          rank: track.rank,
        }));
      }),
    );
  }

  async discoverFriendCategories(
    userId: string,
    friendId: string,
  ): Promise<DiscoveredFriendCategory[]> {
    return this.repositoryService.friendRepo.discoverFriendCategories(userId, friendId);
  }
}
