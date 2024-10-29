import { Controller, Get, Param, Query } from '@nestjs/common';
import { ArtistsService } from '../services/artists.service';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  GetArtistBlurbsQueryDto,
  GetArtistBlurbsResponseDto,
  GetArtistCategoryResponseDto,
  GetArtistDefaultQueryDto,
  GetArtistDefaultResponseDto,
  GetArtistFeedQueryDto,
  GetArtistFeedResponseDto,
  GetArtistsQueryDto,
  GetArtistsResponseDto,
  GetArtistTracksQueryDto,
  GetArtistTracksResponseDto,
  SearchArtistQueryDto,
  SearchArtistResponseDto,
} from '../dto/api-dto/artist.api-dto';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { FeedService } from '../../feed/services/feed.service';
import { ArtistIdParamDto } from '../../../Tools/dto/main-api.dto';
import { ArtistBuzzDto, ArtistDto } from '../dto/artists.dto';
import { SearchFriendsQueryValidationPipe } from '../../../Tools/Validators/pipes/search-friends-query.validator';
import { AnalyticsService } from '../../analytics/services/analytics.service';
import { PaginatedItems } from '../../../Tools/dto/util-classes';

@Controller('artist')
@ApiTags('Artists')
@ApiBearerAuth()
export class ArtistController {
  constructor(
    private readonly artistsService: ArtistsService,
    private readonly analyticsService: AnalyticsService,
    private readonly feedService: FeedService,
  ) {}

  @Get('/default')
  @ApiOperation({
    summary: 'Returns recently most followed artists',
  })
  @ApiResponse({ status: 200, type: GetArtistDefaultResponseDto })
  async getArtistDefault(
    @Query() query: GetArtistDefaultQueryDto,
  ): Promise<GetArtistDefaultResponseDto> {
    return this.artistsService.getDefaultArtists(query);
  }

  @Get('/:artistId/tracks')
  @ApiOperation({
    summary: 'Returns artist tracks',
  })
  @ApiResponse({ status: 200, type: GetArtistTracksResponseDto })
  async getArtistTracks(
    @Param() param: ArtistIdParamDto,
    @Query() query: GetArtistTracksQueryDto,
  ): Promise<GetArtistTracksResponseDto> {
    const [artist, tracks] = await Promise.all([
      this.artistsService.getSpotifyArtist(param.artistId),
      this.artistsService.getArtistTracks(param.artistId, query),
    ]);

    return {
      artistId: param.artistId,
      artistKey: artist.artistKey,
      skip: tracks.skip,
      take: tracks.take,
      total: tracks.total,
      tracks: tracks.items,
    };
  }

  @Get('/buzzChart/:artistId')
  @ApiOperation({
    summary: 'Returns artist buzz chart',
  })
  @ApiResponse({ status: 200, type: [ArtistBuzzDto] })
  async getArtistBuzzChart(@Param() param: ArtistIdParamDto): Promise<ArtistBuzzDto[]> {
    return this.artistsService.getArtistBuzzChartFull(param.artistId);
  }

  @Get('/category/:artistId')
  @ApiOperation({
    summary: 'Returns artist category',
  })
  @ApiResponse({ status: 200, type: GetArtistCategoryResponseDto })
  async getArtistCategory(@Param() param: ArtistIdParamDto): Promise<GetArtistCategoryResponseDto> {
    return this.artistsService.getArtistCategory(param.artistId);
  }

  @Get('/blurbs/:artistId')
  @ApiOperation({
    summary: 'Returns artist release blurbs',
  })
  @ApiResponse({ status: 200, type: GetArtistBlurbsResponseDto })
  async getArtistBlurbs(
    @Param() param: ArtistIdParamDto,
    @Query() query: GetArtistBlurbsQueryDto,
  ): Promise<GetArtistBlurbsResponseDto> {
    const releases = await this.artistsService.getArtistReleaseBlurbs(param.artistId, query);

    return {
      skip: releases.skip,
      take: releases.take,
      total: releases.total,
      releases: releases.items,
    };
  }

  @Get('/search')
  @ApiOperation({
    summary: 'Searches artists by name',
  })
  @ApiResponse({ status: 200, type: SearchArtistResponseDto })
  async searchArtists(
    @Query(new SearchFriendsQueryValidationPipe()) query: SearchArtistQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<SearchArtistResponseDto> {
    let artists: PaginatedItems<any>;

    if (query.query) {
      await this.analyticsService.logArtistSearch(query.query, ctx.userId);
      artists = await this.artistsService.searchArtistsByName(ctx.userId, query);
    } else {
      artists = await this.artistsService.searchArtistsByGenreAndCategory(ctx.userId, query);
    }

    return {
      skip: query.skip,
      take: query.take,
      count: artists.total,
      artists: artists.items,
    };
  }

  @Get('')
  @ApiOperation({
    summary: 'Returns list of artists',
  })
  @ApiResponse({ status: 200, type: GetArtistsResponseDto })
  async getArtists(
    @Query() query: GetArtistsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetArtistsResponseDto> {
    const artists = await this.artistsService.getArtists(ctx.userId, query);

    return {
      skip: artists.skip,
      take: artists.take,
      count: artists.total,
      artists: artists.items,
    };
  }

  @Get('/feed')
  @ApiOperation({
    summary: 'Returns user artists feed',
  })
  @ApiResponse({ status: 200, type: GetArtistFeedResponseDto })
  async getArtistFeed(
    @Query() query: GetArtistFeedQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetArtistFeedResponseDto> {
    const feed = await this.feedService.getArtistFeedV1(ctx.userId, query);

    return {
      userId: ctx.userId,
      date: query.date,
      skip: feed.skip,
      take: feed.take,
      total: feed.total,
      feed: feed.items,
    };
  }

  @Get('/:artistId')
  @ApiOperation({
    summary: 'Returns artist by artistId',
  })
  @ApiResponse({ status: 200, type: ArtistDto })
  getArtist(@Param() params: ArtistIdParamDto, @ResCtx() ctx: ResponseContext): Promise<ArtistDto> {
    return this.artistsService.getArtistById(params.artistId, ctx.userId);
  }
}
