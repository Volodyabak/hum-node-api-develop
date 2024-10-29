import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { RestfulQuery, RestQuery } from '../../../decorators/restful-query.decorator';
import { UsersService } from '../services/users.service';
import { UserRestQueryColumns } from '../constants';
import {
  AddUserEmailsBodyDto,
  GetSharedBrackhitsResponseDto,
  GetSpotifyUserPlaylistsResponseDto,
  GetUserArtistsQueryDto,
  GetUserArtistsResponseDto,
  GetUserBrackhitsQueryDto,
  GetUserBrackhitsResponseDto,
  GetUserByIdQueryDto,
  GetUserByIdResponse,
  GetUserResponseDto,
  GetUserSpotifyPlaylistsQueryDto,
  PostUserArtistsFollowBodyDto,
  PostUserGetMeBodyDto,
  UserLikesOutput,
} from '../dto/users-api.dto';
import { BrackhitsService } from '../../brackhits/services/brackhits.service';
import { FriendsService } from '../../friends/services/friends.service';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { UsersParser } from '../services/users-parser';
import { AWSUsersModel, UserFeedPreferencesModel } from '../../../../database/Models';
import {
  CentralIdParamDto,
  PaginationQueryDto,
  UserBrackhitIdsParamDto,
  UserIdParamDto,
} from '../../../Tools/dto/main-api.dto';
import { RepositoryService } from '../../repository/services/repository.service';
import { NotFoundError } from '../../../Errors';
import { OneSignalService } from '../../one-signal/services/one-signal.service';
import {
  GetBrackhitTopArtistsResponseDto,
  GetBrackhitTopTracksResponseDto,
} from '../../brackhits/api-dto/brackhits-api.dto';
import { UserLocationInput } from '../dto/input/put-user-location.input.dto';
import { PutUserLocationOutput } from '../dto/output/put-user-location.output.dto';
import { BallotIdParam, PostUserBallotChoicesBody } from '../../ballots/dto/ballots.dto';
import { BallotsService } from '../../ballots/services/ballots.service';
import { CampaignIdDto } from '../../campaigns/dto/campaign.dto';

@Controller('user')
@ApiTags('Users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly brackhitsService: BrackhitsService,
    private readonly friendsService: FriendsService,
    private readonly repoService: RepositoryService,
    private readonly oneSignalService: OneSignalService,
    private readonly ballotsService: BallotsService,
  ) {}

  @Get('/me')
  @ApiOperation({
    summary: 'Returns token user data',
  })
  @ApiResponse({ status: 200 })
  async getMe(@ResCtx() ctx: ResponseContext) {
    return this.usersService.getMe(ctx.userId);
  }

  @Get('/:userId/me')
  @ApiOperation({
    summary: 'Returns token user data',
  })
  @ApiResponse({ status: 200 })
  async getUserProfile(@Param() params: UserIdParamDto, @ResCtx() ctx: ResponseContext) {
    return this.usersService.getUserProfile(ctx.userId, params.userId);
  }

  @Post('/link/emails')
  @ApiOperation({
    summary: 'Adds user emails to One Signal',
  })
  @ApiResponse({ status: 200 })
  async addEmailsToOneSignal(@Body() body: AddUserEmailsBodyDto): Promise<any> {
    const users = await AWSUsersModel.query().whereIn('email', body.emails).limit(10);

    // check if all emails are mapped to corresponding aws user
    if (users.length !== body.emails.length) {
      const invalidEmails = body.emails.filter((e) => !users.find((u) => u.email === e));
      if (invalidEmails.length > 0) {
        throw new NotFoundError(
          'Users for given emails are not found: ' + invalidEmails.join(', '),
        );
      }
    }

    return Promise.all(
      users.map((u) =>
        this.oneSignalService.addUserEmailDevice({
          userId: u.sub,
          email: u.email,
        }),
      ),
    );
  }

  @Get('/:userId/sharedBrackhits')
  @ApiOperation({
    summary: 'Returns brackhits completed by both users',
  })
  @ApiResponse({ status: 200, type: GetSharedBrackhitsResponseDto })
  async getSharedBrackhits(
    @Param() params: UserIdParamDto,
    @Query() query: PaginationQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetSharedBrackhitsResponseDto> {
    return this.usersService.getSharedBrackhits(ctx.userId, params.userId, query);
  }

  @Get('/:userId/brackhits/top-tracks')
  async getUserTopTracks(
    @Param() params: UserIdParamDto,
    @Query() query: PaginationQueryDto,
  ): Promise<GetBrackhitTopTracksResponseDto> {
    return this.usersService.getUserTopTracks(params.userId, query);
  }

  @Get('/:userId/brackhits/top-artists')
  async getUserTopArtists(
    @Param() params: UserIdParamDto,
    @Query() query: PaginationQueryDto,
  ): Promise<GetBrackhitTopArtistsResponseDto> {
    return this.usersService.getUserTopArtists(params.userId, query);
  }

  @Get('/:userId/brackhits/:brackhitId')
  @ApiOperation({
    summary: 'Returns user brackhit choices',
  })
  @ApiResponse({ status: 200 })
  async getUserBrackhitChoices(
    @Param() params: UserBrackhitIdsParamDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    return this.usersService.getUserBrackhitsChoices(ctx.userId, params.userId, params.brackhitId);
  }

  @Post('/getMe')
  @ApiOperation({
    summary: 'Sets token user data',
  })
  @ApiResponse({ status: 200 })
  async setUserProfile(
    @Body() body: PostUserGetMeBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<AWSUsersModel> {
    return this.usersService.updateAwsUser(ctx.userId, body);
  }

  @Get('/playlists')
  @ApiOperation({
    summary: 'Returns spotify playlists created by user',
  })
  @ApiResponse({ status: 200, type: GetSpotifyUserPlaylistsResponseDto })
  async getSpotifyPlaylists(
    @Query() query: GetUserSpotifyPlaylistsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetSpotifyUserPlaylistsResponseDto> {
    return this.usersService.getUserSpotifyPlaylistsResponse(ctx.userId, query);
  }

  @Post('/artistFollow')
  @ApiOperation({
    summary: 'Adds artists to user feed',
  })
  @ApiResponse({ status: 200, type: GetUserArtistsResponseDto })
  async addArtistsToUserFeed(
    @Body() body: PostUserArtistsFollowBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<UserFeedPreferencesModel[] | number[]> {
    if (body.following) {
      return this.usersService.saveArtistsToUserFeed(ctx.userId, body.artistIds);
    } else {
      return this.usersService.deleteArtistsFromUserFeed(ctx.userId, body.artistIds);
    }
  }

  @Get('/likes')
  @ApiOperation({
    summary: 'Returns user likes',
  })
  @ApiResponse({ status: 200, type: UserLikesOutput })
  async getLikes(
    @Query() query: PaginationQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<UserLikesOutput> {
    return this.usersService.getUserLikes(ctx.userId, query);
  }

  @Delete('/likes/:centralId')
  @ApiOperation({
    summary: 'Delete user likes',
  })
  @ApiResponse({ status: 200, type: UserLikesOutput })
  async deleteLikes(@Param() params: CentralIdParamDto, @ResCtx() ctx: ResponseContext) {
    return this.usersService.deleteUserLikes(ctx.userId, params.centralId);
  }

  @Put('/location')
  @ApiOperation({})
  @ApiResponse({ status: 200, type: PutUserLocationOutput })
  async updateUserLocation(
    @Body() body: UserLocationInput,
    @ResCtx() ctx: ResponseContext,
  ): Promise<PutUserLocationOutput> {
    return this.usersService.updateUserLocation(ctx.userId, body);
  }

  @Get(':userId/artists')
  @ApiOperation({
    summary: 'Returns user artists',
  })
  @ApiResponse({ status: 200, type: GetUserArtistsResponseDto })
  async getUserArtists(
    @Param() params: UserIdParamDto,
    @Query() query: GetUserArtistsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetUserArtistsResponseDto> {
    const artistsData = await this.usersService.getUserArtists(ctx.userId, params.userId, query);
    return {
      userId: params.userId,
      skip: artistsData.skip,
      take: artistsData.take,
      total: artistsData.total,
      artists: UsersParser.parseUserArtists(artistsData.items),
    };
  }

  @Get('/:userId')
  @ApiOperation({
    summary: 'Returns user full profile, relationship status and created brackhits',
  })
  @ApiResponse({
    status: 200,
    type: GetUserByIdResponse,
  })
  async getUserById(
    @Param() params: UserIdParamDto,
    @Query() query: GetUserByIdQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetUserByIdResponse> {
    const [profile, relationship, createdBrackhitsData, completed] = await Promise.all([
      this.usersService.getFullUserProfile(params.userId),
      this.friendsService.getUserFriendStatus(ctx.userId, params.userId),
      this.usersService.getUserCreatedBrackhitsPI(params.userId, query),
      this.repoService.userRepo.getUserCompletedBrackhits(params.userId).resultSize(),
    ]);

    return {
      ...profile,
      relationship,
      skip: createdBrackhitsData.skip,
      take: createdBrackhitsData.take,
      total: createdBrackhitsData.total,
      totalCompletedBrackhits: completed, //trigger
      createdBrackhits: UsersParser.parseUserCreatedBrackhitsPreview(createdBrackhitsData.items),
    };
  }

  @Get('/:userId/brackhits')
  @ApiOperation({
    summary: 'Returns user brackhits data and user top stats',
    description:
      'User brackhits data contains user brackhits and brackhits created by user.' +
      'Top stats object contains user top artist and top track',
  })
  @ApiResponse({
    status: 200,
    type: GetUserBrackhitsResponseDto,
  })
  async getUserBrackhits(
    @Param() params: UserIdParamDto,
    @Query() query: GetUserBrackhitsQueryDto,
  ): Promise<GetUserBrackhitsResponseDto> {
    const [userBrackhits, createdBrackhits, topStats] = await Promise.all([
      this.usersService.getUserBrackhitsPI(params.userId, {
        completed: query.completed,
        skip: query.skipUB,
        take: query.takeUB,
      }),
      this.usersService.getUserCreatedBrackhitsPI(params.userId, {
        skip: query.skipCB,
        take: query.takeCB,
      }),
      this.usersService.getUserTopStats(params.userId),
    ]);

    return {
      userId: params.userId,
      skipUB: userBrackhits.skip,
      takeUB: userBrackhits.take,
      total: userBrackhits.total,
      completedCount: userBrackhits.value,
      brackhits: UsersParser.parseUserBrackhits(userBrackhits.items),
      skipCB: createdBrackhits.skip,
      takeCB: createdBrackhits.take,
      created: createdBrackhits.total,
      createdBrackhits: UsersParser.parseUserCreatedBrackhits(createdBrackhits.items),
      topStats,
    };
  }

  @Delete('/')
  @ApiOperation({ summary: 'Deletes user' })
  @ApiResponse({ status: 200 })
  async deleteUser(@ResCtx() ctx: ResponseContext): Promise<void> {
    await this.usersService.deleteAwsUser(ctx.userId, ctx.accessToken);
  }

  @Get()
  @ApiOperation({
    summary: 'Returns users filtered by some criteria, also supports sorting and pagination',
    description:
      'Filtering is performed by query params in RHS colon style which have such structure: ' +
      '[columnName]__[SQLOperator]=[value]. List of all SQL operators is available by this link ' +
      'https://www.npmjs.com/package/restful-filter',
  })
  @ApiQuery({
    name: 'skip',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'take',
    required: false,
    type: Number,
  })
  @ApiQuery({
    name: 'order_by',
    required: false,
    type: String,
    description:
      'accepts any column from user or profile object as a value. Examples:\n' +
      '1. order_by=firstName (sort by firstName in ascending order);\n' +
      '2. order_by=-firstName (sort by firstName in descending order);\n' +
      '3. order_by=firstName,-lastName (sort by firstName ASC and by lastName DESC).',
  })
  @ApiResponse({ status: 200, type: GetUserResponseDto })
  async getUsers(
    @RestQuery(UserRestQueryColumns) restQuery: RestfulQuery,
  ): Promise<GetUserResponseDto> {
    const [users, total] = await Promise.all([
      this.usersService.getUserByRestQuery(restQuery),
      this.usersService.getUserByRestQueryCount(restQuery),
    ]);

    return {
      skip: restQuery.paginationParams.skip,
      take: restQuery.paginationParams.take,
      total,
      users,
    };
  }

  // todo: ensure that this endpoint is not used and remove it
  // @Post('/ballots/:ballotId')
  // async postUserBallotChoices(
  //   @Param() params: BallotIdParam,
  //   @Body() body: PostUserBallotChoicesBody,
  //   @Query() query: CampaignIdDto,
  // ) {
  //   return this.ballotsService.saveUserBallotChoices(params.ballotId, query.campaignId, body);
  // }
}
