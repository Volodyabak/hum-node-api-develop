import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { BrackhitsService } from '../services/brackhits.service';
import {
  formatBrackhitMasterResponse,
  formatGetBrackhitResponse,
  formatGetBrackhitResultsResponse,
} from '../utils/brackhits-response.utils';
import { BrackhitMasterResponseDto } from '../dto/brackhits-master.dto';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { GetBrackhitTopUsersQueryDto, GetTopUsersResponseDto } from '../dto/brackhits-home.dto';
import { BrackhitsHomeService } from '../services/brackhits-home.service';
import {
  CompareMasterBrackhitResponseDto,
  GetBrackhitAnswersDto,
  GetBrackhitFriendsQueryDto,
  GetBrackhitFriendsResponseDto,
  GetBrackhitHotTakesQueryDto,
  GetBrackhitHotTakesResponseDto,
  GetBrackhitResponseDto,
  GetBrackhitResultsResponseDto,
  GetBrackhitsArtistQueryDto,
  GetBrackhitsArtistResponseDto,
  GetBrackhitsByHubAndTagQueryDto,
  GetBrackhitsByHubAndTagResponseDto,
  GetBrackhitsTopItemsQueryDto,
  GetBrackhitTopArtistsResponseDto,
  GetBrackhitTopTracksResponseDto,
  GetBrackhitUsersQueryDto,
  GetBrackhitUsersResponseDto,
  GetDailyStreakQueryDto,
  GetDailyStreakResponseDto,
  GetSavedBrackhitsQueryDto,
  GetSavedBrackhitsResponseDto,
  GetSavedTracksQueryDto,
  GetSavedTracksResponse,
  GetTagBrackhitsQueryDto,
  PostBrackhitAnswersDto,
  PutBrackhitUserChoiceParamDto,
  SaveBrackhitBodyDto,
  SaveTrackBodyDto,
  SearchBrackhitsQueryDto,
  SuggestBrackhitsQueryDto,
  UpdateBrackhitDto,
  UploadBrackhitImageResponse,
} from '../api-dto/brackhits-api.dto';
import {
  ArtistIdParamDto,
  BrackhitIdParamDto,
  BrackhitIdUserIdParamDto,
  DateQueryDto,
  HubIdTagIdParamsDto,
  TagIdParamDto,
} from '../../../Tools/dto/main-api.dto';
import { UserSavedBrackhitsModel, UserSavedTracksModel } from '../../../../database/Models';
import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from '../../users/services/users.service';
import { RepositoryService } from '../../repository/services/repository.service';
import { BrackhitsUtils } from '../utils/brackhits.utils';
import { ErrorConst } from '../../../constants';
import { NotFoundError } from '../../../Errors';

@Controller('brackhits')
@ApiTags('Brackhits')
@ApiBearerAuth()
export class BrackhitsController {
  constructor(
    private readonly brackhitsService: BrackhitsService,
    private readonly repoService: RepositoryService,
    private readonly usersService: UsersService,
    private readonly brackhitsHomeService: BrackhitsHomeService,
  ) {}

  @Get('/:brackhitId/friends')
  @ApiOperation({
    summary: 'Returns token user friends who completed a brackhit',
  })
  @ApiResponse({ status: 200, type: GetBrackhitFriendsResponseDto })
  async getBrackhitFriends(
    @Param() param: BrackhitIdParamDto,
    @Query() query: GetBrackhitFriendsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetBrackhitFriendsResponseDto> {
    return this.brackhitsService.getUserFriendsThatCompletedBrackhit(
      param.brackhitId,
      ctx.userId,
      query,
    );
  }

  @Get('/ftue')
  @ApiOperation({
    summary: 'Returns brackhit ftue',
  })
  @ApiResponse({ status: 200 })
  async getBrackhitsFtue(): Promise<any> {
    return this.brackhitsService.getBrackhitsFtue();
  }

  @Get('/:brackhitId/compare/:userId')
  @ApiOperation({
    summary: 'Returns brackhit preview',
  })
  @ApiResponse({ status: 200 })
  async compareUserBrackhit(
    @Param() params: BrackhitIdUserIdParamDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    return this.brackhitsService.compareBrackhitToUser(
      params.brackhitId,
      ctx.userId,
      params.userId,
    );
  }

  @Get('/:brackhitId/preview')
  @ApiOperation({
    summary: 'Returns brackhit preview',
  })
  @ApiResponse({ status: 200 })
  async getBrackhitPreview(
    @Param() params: BrackhitIdParamDto,
    @Query() query: DateQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    const brackhit = await this.brackhitsService.getBrackhitById(params.brackhitId);

    if (!brackhit) {
      // todo: replace "NotFoundError" with built in "NotFoundException"
      throw new NotFoundError(ErrorConst.BRACKHIT_NOT_FOUND);
    }

    const [meta, commentsCount, submissions, tags, genres, liked, totalLikes] = await Promise.all([
      this.brackhitsService.getBrackhitMeta(params.brackhitId, ctx.userId, query.date, {
        fetchOwner: true,
      }),
      this.repoService.brackhitCommentRepo.getBrackhitComments(params.brackhitId).resultSize(),
      this.brackhitsService.getBrackhitCompletions(params.brackhitId),
      this.brackhitsService.getBrackhitTags(params.brackhitId),
      this.brackhitsService.getBrackhitGenres(params.brackhitId),
      this.brackhitsService.isUserLikedBrackhit(ctx.userId, params.brackhitId),
      this.brackhitsService.getBrackhitTotalLikes(params.brackhitId),
    ]);

    const addOwner = meta.ownerId && !BrackhitsUtils.isArtistory(meta.ownerId);
    const owner = meta.owner;
    delete meta.owner;

    return {
      ...meta,
      username: addOwner ? owner?.username : undefined,
      userImage: addOwner ? owner?.userImage : undefined,
      commentsCount,
      submissions,
      tags,
      genres,
      liked,
      totalLikes,
    };
  }

  @Get('/tags/:tagId')
  @ApiOperation({
    summary: 'Returns most popular brackhits by tag id',
  })
  @ApiResponse({ status: 200 })
  async getPopularTagBrackhits(
    @Param() param: TagIdParamDto,
    @Query() query: GetTagBrackhitsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    return this.brackhitsService.getMostPopularTagBrackhits(param.tagId, ctx.userId, query);
  }

  @Get('/search')
  @ApiOperation({
    summary: 'Returns brackhits searched by query',
  })
  @ApiResponse({ status: 200 })
  async searchBrackhits(
    @Query() query: SearchBrackhitsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    return this.brackhitsService.searchBrackhits(ctx.userId, query);
  }

  @Get('/suggest')
  @ApiOperation({
    summary: 'Returns suggested brackhits for user',
  })
  @ApiResponse({ status: 200 })
  async suggestBrackhits(
    @Query() query: SuggestBrackhitsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    if (!query.brackhitId && query.userId) {
      return this.brackhitsService.getSuggestedBrackhitsForUser(query);
    } else if (!query.userId && query.brackhitId) {
      return this.brackhitsService.getSuggestedBrackhits(ctx.userId, query);
    } else {
      throw new BadRequestException('Either userId or brackhitId query param must be provided');
    }
  }

  @Get('/top/tracks')
  @ApiOperation({
    summary: 'Returns user top brackhit tracks',
  })
  @ApiResponse({ status: 200, type: GetBrackhitTopTracksResponseDto })
  async getUserTopTracks(
    @Query() query: GetBrackhitsTopItemsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetBrackhitTopTracksResponseDto> {
    return this.usersService.getUserTopTracks(ctx.userId, query);
  }

  @Get('/top/artists')
  @ApiOperation({
    summary: 'Returns user top brackhit artists',
  })
  @ApiResponse({ status: 200, type: GetBrackhitTopArtistsResponseDto })
  async getUserTopArtists(
    @Query() query: GetBrackhitsTopItemsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetBrackhitTopArtistsResponseDto> {
    return this.usersService.getUserTopArtists(ctx.userId, query);
  }

  @Get('/top/choices')
  @ApiOperation({
    summary: 'Returns user winner choices',
  })
  @ApiResponse({ status: 200 })
  async getUserTopChoices(
    @Query() query: GetBrackhitsTopItemsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    return this.usersService.getUserTopChoices(ctx.userId, query);
  }

  @Get('/:brackhitId/compare')
  @ApiOperation({
    summary: 'Compares user brackhit to master brackhit',
  })
  @ApiResponse({ status: 200, type: CompareMasterBrackhitResponseDto })
  async compareBrackhitToMaster(
    @Param() param: BrackhitIdParamDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<CompareMasterBrackhitResponseDto> {
    return this.brackhitsService.compareBrackhitToMaster(param.brackhitId, ctx.userId);
  }

  @Post('/:brackhitId/submit')
  @ApiOperation({
    summary: 'Submits user brackhit choices',
  })
  @ApiResponse({ status: 200 })
  async submitBrackhit(
    @Param() param: BrackhitIdParamDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<void> {
    await this.brackhitsService.submitBrackhit(ctx.userId, param.brackhitId);
  }

  @Put('/choice/:brackhitId/:roundId/:choiceId')
  @ApiOperation({
    summary: 'Saves user brackhit choice',
  })
  @ApiResponse({ status: 200 })
  async createUserChoice(
    @Param() param: PutBrackhitUserChoiceParamDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<void> {
    await this.brackhitsService.createBrackhitUserChoice(ctx.userId, param);
  }

  @Get('/saved')
  @ApiOperation({
    summary: 'Returns user saved brackhits',
  })
  @ApiResponse({ status: 200, type: GetSavedBrackhitsResponseDto })
  async getSavedBrackhits(
    @Query() query: GetSavedBrackhitsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetSavedBrackhitsResponseDto> {
    return this.brackhitsService.getSavedBrackhits(ctx.userId, query);
  }

  @Post('/saved')
  @ApiOperation({
    summary: 'Saves user brackhit',
  })
  @ApiResponse({ status: 200, type: UserSavedBrackhitsModel })
  async saveBrackhit(
    @Body() body: SaveBrackhitBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<UserSavedBrackhitsModel> {
    return this.brackhitsService.saveBrackhit(ctx.userId, body);
  }

  @Get('/daily/streak')
  @ApiOperation({
    summary: 'Returns user daily brackhits streak',
  })
  @ApiResponse({ status: 200, type: GetDailyStreakResponseDto })
  async getDailyStreak(
    @Query() query: GetDailyStreakQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetDailyStreakResponseDto> {
    return this.brackhitsService.getDailyStreakResponse(ctx.userId, query);
  }

  @Get('/:brackhitId/results')
  @ApiOperation({
    summary: 'Returns brackhit results',
  })
  @ApiResponse({ status: 200, type: GetBrackhitResultsResponseDto })
  async getBrackhitResults(
    @Param() params: BrackhitIdParamDto,
    @Query() query: DateQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetBrackhitResultsResponseDto> {
    await this.brackhitsService.getBrackhitById(params.brackhitId);

    const [meta, results] = await Promise.all([
      this.brackhitsService.getBrackhitMeta(params.brackhitId, ctx.userId, query.date, {
        fetchOwner: false,
      }),
      this.brackhitsService.getBrackhitResults(params.brackhitId),
    ]);

    return formatGetBrackhitResultsResponse(meta, results);
  }

  @Get('/savedTrack')
  @ApiOperation({
    summary: 'Returns user saved brackhit tracks',
  })
  @ApiResponse({ status: 200, type: GetSavedTracksResponse })
  async getSavedTracks(
    @Query() query: GetSavedTracksQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetSavedTracksResponse> {
    return this.brackhitsService.getSavedTracks(ctx.userId, query);
  }

  @Post('/savedTrack')
  @ApiOperation({
    summary: 'Saves brackhit track',
  })
  @ApiResponse({ status: 200, type: UserSavedTracksModel })
  async saveTrack(
    @Body() body: SaveTrackBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<UserSavedTracksModel> {
    return this.brackhitsService.saveTrack(ctx.userId, body);
  }

  @Get('/ftue/:hubId/:tagId')
  @ApiOperation({
    summary: 'Returns brackhits by tagId and hubId',
  })
  @ApiResponse({ status: 200, type: GetBrackhitsByHubAndTagResponseDto })
  async getBrackhitsByHubAndTag(
    @Param() params: HubIdTagIdParamsDto,
    @Query() query: GetBrackhitsByHubAndTagQueryDto,
  ): Promise<GetBrackhitsByHubAndTagResponseDto> {
    const data = await this.brackhitsService.getBrackhitsByHubAndTagPI(
      params.hubId,
      params.tagId,
      query,
    );

    return {
      hubId: params.hubId,
      tagId: params.tagId,
      skip: data.skip,
      take: data.take,
      total: data.total,
      brackhits: data.items,
    };
  }

  @Get('/hotTakes/all')
  @ApiOperation({
    summary: 'Returns brackhit hot takes',
  })
  @ApiResponse({ status: 200, type: GetBrackhitHotTakesResponseDto })
  async getBrackhitHotTakes(
    @Query() query: GetBrackhitHotTakesQueryDto,
  ): Promise<GetBrackhitHotTakesResponseDto> {
    return this.brackhitsService.getBrackhitsHotTakesPI(query);
  }

  @Get('artist/:artistId')
  @ApiOperation({
    summary: 'Returns brackhits in which specified artist appears on',
    description:
      'Track brackhit contains an artist if it has more than 3 track choices from specified artist. ' +
      'Artist brackhit will be returned if it has at least one artist choice of specified artist.',
  })
  @ApiResponse({ status: 200, type: GetBrackhitsArtistResponseDto })
  async getBrackhitsContainingArtist(
    @Param() params: ArtistIdParamDto,
    @Query() query: GetBrackhitsArtistQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetBrackhitsArtistResponseDto> {
    return this.brackhitsService.getBrackhitsContainingArtist(params.artistId, ctx.userId, query);
  }

  @Get(':brackhitId/master')
  @ApiOperation({
    summary: 'Create playlist',
    description: 'Create playlist for brackhit',
  })
  @ApiResponse({ status: 200, type: BrackhitMasterResponseDto })
  async getBrackhitsMaster(
    @Param() params: BrackhitIdParamDto,
  ): Promise<BrackhitMasterResponseDto> {
    const { matchups, winners } = await this.brackhitsService.getBrackhitsMaster(params.brackhitId);
    return formatBrackhitMasterResponse(matchups, winners as any);
  }

  @Delete(':brackhitId/choices')
  @ApiOperation({
    summary: 'Deletes all user brackhit data',
    description:
      'Deletes user brackhit choices, score and completion data, starts brackhit results calculation',
  })
  @ApiResponse({ status: 200, type: BrackhitMasterResponseDto })
  async deleteUserBrackhitChoices(
    @Param() params: BrackhitIdParamDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<void> {
    await this.brackhitsService.checkIfUserBrackhitIsCompleted(params.brackhitId, ctx.userId);
    await this.brackhitsService.deleteUserBrackhitData(params.brackhitId, ctx.userId);
  }

  @Get('/featured/users')
  @ApiOperation({
    summary: 'Returns data for Top Users screen',
  })
  @ApiResponse({ status: 200, type: GetTopUsersResponseDto })
  async getBrackhitsTopUsers(
    @Query() query: GetBrackhitTopUsersQueryDto,
  ): Promise<GetTopUsersResponseDto> {
    if (query.categoryId === undefined) {
      return this.brackhitsHomeService.getFeaturedUsersResponse(query);
    } else {
      return this.brackhitsHomeService.getFeaturedUsersCategoryResponse(query);
    }
  }

  @Get('/:brackhitId')
  @ApiOperation({
    summary: 'Returns brackhit by id',
  })
  @ApiResponse({ status: 200, type: GetBrackhitResponseDto })
  async getBrackhit(
    @Param() params: BrackhitIdParamDto,
    @Query() query: DateQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetBrackhitResponseDto> {
    await this.brackhitsService.getBrackhitById(params.brackhitId);

    const [meta, choices] = await Promise.all([
      this.brackhitsService.getBrackhitMeta(params.brackhitId, ctx.userId, query.date),
      this.brackhitsService.getBrackhitChoices(params.brackhitId, { withVotes: true }),
    ]);

    return formatGetBrackhitResponse(meta, choices);
  }

  @Get('/:brackhitId/answers')
  async getBrackhitAnswers(
    @Param() params: BrackhitIdParamDto,
    @Query() query: GetBrackhitAnswersDto,
  ): Promise<any> {
    return this.brackhitsService.getBrackhitAnswers({
      brackhitId: params.brackhitId,
      ...query,
    });
  }

  @Put('/:brackhitId')
  @ApiOperation({ summary: 'Update brackhit' })
  @ApiResponse({ status: 200, type: BrackhitModel })
  async updateBrackhit(
    @Param() params: BrackhitIdParamDto,
    @Body() body: UpdateBrackhitDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<BrackhitModel> {
    return this.brackhitsService.updateBrackhit(ctx.userId, params.brackhitId, body);
  }

  @Post('uploadimage')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadBrackhitImageResponse> {
    return this.brackhitsService.uploadBrackhitImage(file);
  }

  @Get('/:brackhitId/users')
  @ApiOperation({ summary: 'Get brackhit users' })
  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 200, type: [GetBrackhitUsersResponseDto] })
  async getBrackhitUsers(
    @Param() params: BrackhitIdParamDto,
    @Query() query: GetBrackhitUsersQueryDto,
  ): Promise<GetBrackhitUsersResponseDto[]> {
    return this.brackhitsService.getBrackhitUsers({
      brackhitId: params.brackhitId,
      ...query,
    });
  }

  @Post('/:brackhitId/answers')
  @ApiOperation({ summary: "Adds the user's answers to the comparison" })
  @ApiResponse({ status: 200 })
  async createBrackhitAnswers(
    @Param() params: BrackhitIdParamDto,
    @Body() body: PostBrackhitAnswersDto,
  ) {
    return this.brackhitsService.createBrackhitAnswers({
      brackhitId: params.brackhitId,
      userId: body.userId,
      campaignId: body.campaignId,
    });
  }
}
