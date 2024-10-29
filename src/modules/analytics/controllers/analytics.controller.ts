import { Body, Controller, Delete, Param, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

import { AnalyticsService } from '../services/analytics.service';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import {
  BrackhitCreationBodyDto,
  BrackhitPreviewBodyDto,
  BrackhitUserHomeBodyDto,
  CreateBrackhitBtnBodyDto,
  FeedScrollBodyDto,
  LogArtistViewBodyDto,
  LogBottomNavigationDto,
  LogBrackhitCompareDto,
  LogBrackhitHubsDto,
  LogBrackhitVisitDto,
  LogChallengeBodyDto,
  LogContentBodyDto,
  LogNewsArticleDto,
  LogProfileViewDto,
  LogScreenshotDto,
  LogShareBrackhitDto,
  LogSpotifyTrackDto,
  LogUpdateAppDto,
  LogYoutubeVideoDto,
  MyBrackhitBodyDto,
  UpdateContentLogBodyDto,
  UpdateNewsArticleLogBodyDto,
} from '../dto/analytics.dto';
import {
  LogArtistProfileModel,
  LogBrackhitCreateButtonModel,
  LogBrackhitCreationModel,
  LogBrackhitDownloadModel,
  LogBrackhitPreviewModel,
  LogBrackhitUserHomeModel,
  LogBrackhitVisitsModel,
  LogChallengesModel,
  LogCompareModel,
  LogContentModel,
  LogFeedItemsModel,
  LogHubsModel,
  LogNewsitemModel,
  LogProfileVisitsModel,
  LogScreenshotModel,
  LogShareModel,
  LogSpotifySigninSkipModel,
  LogSpotifyTrackModel,
  LogUpdateModel,
  LogUserNavModel,
  LogYoutubeVideoModel,
} from '../../../../database/Models';
import { IdParamDto } from '../../../Tools/dto/main-api.dto';

@Controller('/log')
@ApiTags('Analytics')
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('/content')
  @ApiOperation({ summary: 'Log feed content' })
  @ApiResponse({ status: 200, type: LogContentModel })
  logContent(
    @Body() body: LogContentBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogContentModel> {
    return this.analyticsService.logContent(ctx.userId, body);
  }

  @Put('/content/:id')
  @ApiOperation({ summary: 'Update content log record' })
  @ApiResponse({ status: 200, type: LogContentModel })
  updateContentLog(
    @Body() body: UpdateContentLogBodyDto,
    @Param() param: IdParamDto,
  ): Promise<LogContentModel> {
    return this.analyticsService.updateContentLog(param.id, body);
  }

  @Delete('/content/:id')
  @ApiOperation({ summary: 'Delete content log record' })
  @ApiResponse({ status: 200, type: LogContentModel })
  deleteContentLog(@Param() param: IdParamDto, @ResCtx() ctx: ResponseContext): Promise<number> {
    return this.analyticsService.deleteContentLog(param.id, ctx.userId);
  }

  @Post('/feedScroll')
  @ApiOperation({ summary: 'Log feed scroll' })
  @ApiResponse({ status: 200, type: LogFeedItemsModel })
  feedScroll(
    @Body() body: FeedScrollBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogFeedItemsModel> {
    return this.analyticsService.logFeedScroll(body, ctx.userId);
  }

  @Post('/brackhitsHome')
  @ApiOperation({ summary: 'Log brackhit home' })
  @ApiResponse({ status: 200, type: LogBrackhitUserHomeModel })
  brackhitsHome(
    @Body() body: BrackhitUserHomeBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogBrackhitUserHomeModel> {
    return this.analyticsService.logBrackhitUserHome(body, ctx.userId);
  }

  @Post('/brackhitPreview')
  @ApiOperation({ summary: 'Log brackhit preview' })
  @ApiResponse({ status: 200, type: LogBrackhitPreviewModel })
  brackhitPreview(
    @Body() body: BrackhitPreviewBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogBrackhitPreviewModel> {
    return this.analyticsService.logBrackhitPreview(body, ctx.userId);
  }

  @Post('/makeBrackhit')
  @ApiOperation({ summary: 'Log brackhit creation screen' })
  @ApiResponse({ status: 200, type: LogBrackhitCreateButtonModel })
  makeBrackhit(
    @Body() body: CreateBrackhitBtnBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogBrackhitCreateButtonModel> {
    return this.analyticsService.logMakeBrackhit(body, ctx.userId);
  }

  @Post('/myBrackhit')
  @ApiOperation({ summary: 'Log my brackhit download' })
  @ApiResponse({ status: 200, type: LogBrackhitDownloadModel })
  brackhitDownload(
    @Body() body: MyBrackhitBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogBrackhitDownloadModel> {
    return this.analyticsService.logBrackhitDownload(body, ctx.userId);
  }

  @Post('/createdBrackhit')
  @ApiOperation({ summary: 'Log created brackhit' })
  @ApiResponse({ status: 200, type: LogBrackhitCreationModel })
  brackhitCreation(
    @Body() body: BrackhitCreationBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogBrackhitCreationModel> {
    return this.analyticsService.logBrackhitCreation(body, ctx.userId);
  }

  @Post('/challenges')
  @ApiOperation({ summary: 'Log challenge' })
  @ApiResponse({ status: 200, type: LogChallengesModel })
  challenges(
    @Body() body: LogChallengeBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogChallengesModel> {
    return this.analyticsService.logChallenge(body.challengeId, ctx.userId);
  }

  @Post('/artistView')
  @ApiOperation({ summary: 'Log artist view' })
  @ApiResponse({ status: 200, type: LogArtistProfileModel })
  artistView(
    @Body() body: LogArtistViewBodyDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogArtistProfileModel> {
    return this.analyticsService.logArtistView(ctx.userId, body);
  }

  @Post('/spotifyTrack')
  @ApiOperation({ summary: 'Log spotify track' })
  @ApiResponse({ status: 200, type: LogSpotifyTrackModel })
  spotifyTrack(
    @Body() body: LogSpotifyTrackDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogSpotifyTrackModel> {
    return this.analyticsService.logSpotifyTrack(ctx.userId, body);
  }

  @Post('/youtubeVideo')
  @ApiOperation({ summary: 'Log youtube video' })
  @ApiResponse({ status: 200, type: LogYoutubeVideoModel })
  youtubeVideo(
    @Body() body: LogYoutubeVideoDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogYoutubeVideoModel> {
    return this.analyticsService.logYoutubeVideo(ctx.userId, body.videoKey);
  }

  @Post('/profileView')
  @ApiOperation({ summary: 'Log profile visit' })
  @ApiResponse({ status: 200, type: LogProfileVisitsModel })
  profileView(
    @Body() body: LogProfileViewDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogProfileVisitsModel> {
    return this.analyticsService.logProfileView(ctx.userId, body);
  }

  @Post('/spotifySkip')
  @ApiOperation({ summary: 'Log spotify skip during sign in' })
  @ApiResponse({ status: 200, type: LogSpotifySigninSkipModel })
  spotifySkip(@ResCtx() ctx: ResponseContext): Promise<LogSpotifySigninSkipModel> {
    return this.analyticsService.logSpotifySignInSkip(ctx.userId);
  }

  @Post('/bottomNav')
  @ApiOperation({ summary: 'Log user bottom navigation' })
  @ApiResponse({ status: 200, type: LogUserNavModel })
  bottomNav(
    @Body() body: LogBottomNavigationDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogUserNavModel> {
    return this.analyticsService.logBottomNavigation(ctx.userId, body);
  }

  @Post('/brackhitVisit')
  @ApiOperation({ summary: 'Log brackhit visit' })
  @ApiResponse({ status: 200, type: LogBrackhitVisitsModel })
  brackhitVisit(
    @Body() body: LogBrackhitVisitDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogBrackhitVisitsModel> {
    return this.analyticsService.logBrackhitVisit(ctx.userId, body);
  }

  @Post('/appUpdate')
  @ApiOperation({ summary: 'Log app update' })
  @ApiResponse({ status: 200, type: LogUpdateModel })
  appUpdate(
    @Body() body: LogUpdateAppDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogUpdateModel> {
    return this.analyticsService.logAppUpdate(ctx.userId, body.version);
  }

  @Post('/share')
  @ApiOperation({ summary: 'Log share brackhit' })
  @ApiResponse({ status: 200, type: LogShareModel })
  share(@Body() body: LogShareBrackhitDto, @ResCtx() ctx: ResponseContext): Promise<LogShareModel> {
    return this.analyticsService.logShareBrackhit(ctx.userId, body.brackhitId);
  }

  @Post('/screenshot')
  @ApiOperation({ summary: 'Log screenshot' })
  @ApiResponse({ status: 200, type: LogScreenshotModel })
  screenshot(
    @Body() body: LogScreenshotDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogScreenshotModel> {
    return this.analyticsService.logScreenshot(ctx.userId, body);
  }

  @Post('/compare')
  @ApiOperation({ summary: 'Log brackhit compare' })
  @ApiResponse({ status: 200, type: LogCompareModel })
  compare(
    @Body() body: LogBrackhitCompareDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogCompareModel> {
    return this.analyticsService.logBrackhitCompare(ctx.userId, body);
  }

  @Post('/hubs')
  @ApiOperation({ summary: 'Log hubs' })
  @ApiResponse({ status: 200, type: LogHubsModel })
  hubs(@Body() body: LogBrackhitHubsDto, @ResCtx() ctx: ResponseContext): Promise<LogHubsModel> {
    return this.analyticsService.logBrackhitHubs(ctx.userId, body.hubId);
  }

  @Post('/newsArticle')
  @ApiOperation({ summary: 'Log news article' })
  @ApiResponse({ status: 200, type: LogNewsitemModel })
  newsArticle(
    @Body() body: LogNewsArticleDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<LogNewsitemModel> {
    return this.analyticsService.logNewsArticle(ctx.userId, body);
  }

  @Put('/newsArticle/:id')
  @ApiOperation({ summary: 'Update news article log record' })
  @ApiResponse({ status: 200, type: LogNewsitemModel })
  updateNewsArticle(
    @Body() body: UpdateNewsArticleLogBodyDto,
    @Param() param: IdParamDto,
  ): Promise<LogNewsitemModel> {
    return this.analyticsService.updateNewsArticleLog(param.id, body);
  }
}
