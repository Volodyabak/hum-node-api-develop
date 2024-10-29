import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { FriendsService } from '../services/friends.service';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import {
  DiscoverFriendArtistsResponseDto,
  FriendCompatibilityResponseDto,
  FriendsParamsDto,
  GetFriendsCompatibilityQueryDto,
  PostFriendRequestBodyDto,
  PostFriendRespondBodyDto,
  SearchUsersQueryDto,
  SearchUsersResponseDto,
  UserFriendProfileResponseDto,
} from '../dto/friends.dto';
import { UserFriendCompatabilityModel } from '../../../../database/Models';
import { FriendsUtilsService } from '../services/friends-utils.service';
import { BrackhitsService } from '../../brackhits/services/brackhits.service';
import { UsersService } from '../../users/services/users.service';
import { AppEventsEmitter } from '../../app-events/app-events.emitter';
import { AppEventName } from '../../app-events/app-events.types';
import { ConstantsModel } from '../../../../database/Models/ConstantsModel';
import { ConstantId } from '../../constants/constants';

@Controller('friends')
@ApiTags('Friends')
export class FriendsControllers {
  constructor(
    private readonly friendsService: FriendsService,
    private readonly friendsUtilsService: FriendsUtilsService,
    private readonly usersService: UsersService,
    private readonly brackhitsService: BrackhitsService,
    private readonly appEventsEmitter: AppEventsEmitter,
  ) {}

  @Post('request')
  @ApiOperation({
    summary: 'Sends friend request to a user',
    description: 'Sends friend request from a token user to a requested user inside request body',
  })
  @ApiResponse({ status: 201 })
  async postFriendsRequest(
    @Body() body: PostFriendRequestBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<void> {
    await this.friendsService.checkFriendOutgoingPendingRequest(ctx.userId, body.userRequestedId);
    await this.friendsService.createFriendRequest(ctx.userId, body.userRequestedId);

    this.appEventsEmitter.emit(AppEventName.USER_SENT_FRIEND_REQUEST, {
      userId: ctx.userId,
      friendId: body.userRequestedId,
    });
  }

  @Post('respond-request')
  @ApiOperation({
    summary: 'Sends friend accepted request to a user',
    description:
      'Sends friend accepted request from a token userId to a requested user inside request body',
  })
  @ApiResponse({ status: 200 })
  async postFriendsRespondRequest(
    @Body() body: PostFriendRespondBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<void> {
    await this.friendsService.checkFriendIncomingPendingRequest(ctx.userId, body.userRequestedId);
    await this.friendsService.checkIfUsersAreNotFriends(ctx.userId, body.userRequestedId);

    if (body.accept) {
      await this.friendsService.acceptFriendRequest(body.userRequestedId, ctx.userId);
      await this.friendsService.addUserFriend(body.userRequestedId, ctx.userId);
      await this.friendsService.addUserFriend(ctx.userId, body.userRequestedId);

      this.appEventsEmitter.emit(AppEventName.USER_ACCEPTED_FRIEND_REQUEST, {
        userId: ctx.userId,
        friendId: body.userRequestedId,
      });
    } else {
      await this.friendsService.rejectFriendRequest(ctx.userId, body.userRequestedId);
    }
  }

  @Get('search')
  @ApiOperation({
    summary: 'Returns users filtered by search query',
    description:
      'Searching is performed by checking whether user full name or username contains search query',
  })
  @ApiResponse({ status: 200, type: SearchUsersResponseDto })
  async searchUsers(
    @Query() query: SearchUsersQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<SearchUsersResponseDto> {
    const users = await this.usersService.searchUsersByQuery(ctx.userId, query);

    return {
      skip: users.skip,
      take: users.take,
      count: users.total,
      users: users.items,
    };
  }

  // @Get('unfriend/:friendId')
  // @ApiOperation({
  //   summary: 'Unfriends user friend',
  //   description:
  //     'Unfriends path user from a token user, deletes all friend requests and compatability data',
  // })
  // @ApiResponse({ status: 200 })
  // async unfriendUserFriend(
  //   @Param() params: FriendsParamsDto,
  //   @ResCtx() ctx: ResponseContext,
  // ): Promise<void> {
  //   await this.friendsService.checkIfUsersAreFriends(ctx.userId, params.friendId);
  //
  //   await Promise.all([
  //     this.friendsService.deleteUserFriend(ctx.userId, params.friendId),
  //     this.friendsService.deleteUserFriendCompatability(ctx.userId, params.friendId),
  //     this.friendsService.deleteUserFriendRequests(ctx.userId, params.friendId),
  //     this.friendsService.deleteUserFriendRequests(params.friendId, ctx.userId),
  //   ]);
  // }

  @Delete(':friendId')
  @ApiOperation({
    summary: 'Removes user friend',
    description: 'Removes path user from token user friends',
  })
  @ApiResponse({ status: 200 })
  async deleteUserFriend(
    @Param() params: FriendsParamsDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<void> {
    await this.friendsService.checkIfUsersAreFriends(ctx.userId, params.friendId);
    await this.friendsService.deleteUserFriend(ctx.userId, params.friendId);
  }

  // @Get('top-artists/:friendId')
  // @ApiOperation({
  //   summary: 'Returns user friend top artists',
  // })
  // @ApiResponse({ status: 200, isArray: true, type: FriendTopArtistDto })
  // async getFriendTopArtists(@Param() params: FriendsParamsDto): Promise<FriendTopArtistDto[]> {
  //   return this.usersService.getUserTopArtists(params.friendId);
  // }

  // @Get('top-categories/:friendId')
  // @ApiOperation({
  //   summary: 'Returns user friend top categories',
  // })
  // @ApiResponse({ status: 200, isArray: true, type: UserTopCategoryDto })
  // async getFriendTopCategories(@Param() params: FriendsParamsDto): Promise<UserTopCategoryDto[]> {
  //   return this.usersService.getUserTopCategories(params.friendId);
  // }
  //
  // @Get('top-recent-tracks/:friendId')
  // @ApiOperation({
  //   summary: 'Returns user friend top recent tracks',
  // })
  // @ApiResponse({ status: 200, isArray: true, type: FriendTopTrackDto })
  // async getFriendTopRecentTracks(@Param() params: FriendsParamsDto): Promise<FriendTopTrackDto[]> {
  //   return this.usersService.getUserTopRecentTracks(params.friendId);
  // }

  @Get(':friendId/compatibility')
  @ApiOperation({
    summary: 'Returns friend compatibility data',
    description:
      'Returns comparison of friend genres and badges, shared artists and tracks, brackhits completed by both users',
  })
  @ApiResponse({ status: 200, type: FriendCompatibilityResponseDto })
  async friendCompatibility(
    @Param() params: FriendsParamsDto,
    @Query() query: GetFriendsCompatibilityQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<FriendCompatibilityResponseDto> {
    await this.friendsService.checkIfUsersAreFriends(ctx.userId, params.friendId);

    const [genres, badges, artists, tracks, brackhits] = await Promise.all([
      this.friendsService.getUserFriendComparedGenres(ctx.userId, params.friendId),
      this.friendsService.getUserFriendComparedBadges(ctx.userId, params.friendId),
      this.friendsService.getUserFriendSharedArtists(ctx.userId, params.friendId),
      this.friendsService.getUserFriendSharedTracks(ctx.userId, params.friendId),
      this.brackhitsService.getUserFriendCompatibilityBrackhits(ctx.userId, params.friendId, query),
    ]);

    return {
      genres,
      badges,
      artists,
      tracks,
      skipBrackhits: brackhits.skip,
      takeBrackhits: brackhits.take,
      totalBrackhits: brackhits.total,
      brackhits: brackhits.items,
    };
  }

  @Get(':friendId/compatibility-score')
  @ApiOperation({
    summary: 'Returns user friend compatibility score',
  })
  @ApiResponse({ status: 200, type: UserFriendCompatabilityModel })
  async friendCompatibilityScore(
    @Param() params: FriendsParamsDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<UserFriendCompatabilityModel> {
    await this.friendsService.checkIfUsersAreFriends(ctx.userId, params.friendId);
    return this.friendsService.getUserFriendCompatibility(ctx.userId, params.friendId);
  }

  @Get(':friendId/profile')
  @ApiOperation({
    summary: 'Returns user friend profile data',
    description: 'Returns full user profile, badges, genres, top artists and tracks',
  })
  @ApiResponse({ status: 200, type: UserFriendProfileResponseDto })
  async getFriendProfile(
    @Param() params: FriendsParamsDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<UserFriendProfileResponseDto> {
    await this.friendsService.checkIfUsersAreFriends(ctx.userId, params.friendId);

    const [topTracksConst, topArtistsConst] = await Promise.all([
      ConstantsModel.query().findById(ConstantId.FRIENDS_TOP_TRACKS_COUNT),
      ConstantsModel.query().findById(ConstantId.FRIENDS_TOP_ARTISTS_COUNT),
    ]);

    const [profile, badges, genres, artists, tracks] = await Promise.all([
      this.usersService.getFullUserProfile(params.friendId),
      this.usersService.getUserBadges(params.friendId),
      this.usersService.getUserGenres(params.friendId),
      this.usersService.getUserMostListenedArtists(params.friendId, {
        skip: 0,
        take: topArtistsConst.value,
      }),
      this.usersService.getUserTopRecentTracks(params.friendId, {
        skip: 0,
        take: topTracksConst.value,
      }),
    ]);

    return {
      profile,
      badges,
      musicProfile: genres,
      artists,
      tracks,
    };
  }

  @Get(':friendId/discovery')
  @ApiOperation({
    summary: 'Returns user friend profile data',
    description: 'Returns full user profile, badges, genres, top artists and tracks',
  })
  @ApiResponse({ status: 200, type: DiscoverFriendArtistsResponseDto })
  async discoverWithFriend(
    @Param() params: FriendsParamsDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<DiscoverFriendArtistsResponseDto> {
    await this.friendsService.checkIfUsersAreFriends(ctx.userId, params.friendId);

    const [artists, trending, tracks, categories] = await Promise.all([
      this.friendsService.discoverFriendArtists(ctx.userId, params.friendId),
      this.friendsService.discoverFriendTrending(ctx.userId, params.friendId),
      this.friendsService.discoverFriendTracks(ctx.userId, params.friendId),
      this.friendsService.discoverFriendCategories(ctx.userId, params.friendId),
    ]);

    return {
      artists,
      trending,
      tracks,
      categories,
    };
  }
}
