import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { FeedService } from '../services/feed.service';
import { GetFeedQueryDto } from '../dto/api-dto/feed.api-dto';
import { DateQueryDto, IdParamDto } from '../../../Tools/dto/main-api.dto';

@Controller('feed')
@ApiTags('Feed')
@ApiBearerAuth()
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get('/recommendedArtists')
  @ApiOperation({
    summary: 'Returns recommended feed artists for user',
  })
  @ApiResponse({ status: 200 })
  async getRecommendedArtists(@ResCtx() ctx: ResponseContext): Promise<any> {
    const artists = await this.feedService.getRecommendedArtists(ctx.userId);

    return {
      userId: ctx.userId,
      artists,
    };
  }

  @Get('/')
  @ApiOperation({
    summary: 'Returns user artist feed',
  })
  @ApiResponse({ status: 200 })
  async getFeed(@Query() query: GetFeedQueryDto, @ResCtx() ctx: ResponseContext): Promise<any> {
    const feed = await this.feedService.getArtistFeedV2(ctx.userId, query);

    return {
      userId: ctx.userId,
      date: query.date,
      skip: feed.skip,
      take: feed.take,
      total: feed.total,
      feed: feed.items,
    };
  }

  @Get('/content/:id')
  @ApiOperation({
    summary: 'Returns user artist feed item by central id',
  })
  @ApiResponse({ status: 200 })
  async getCentralFeedItem(
    @Param() params: IdParamDto,
    @Query() query: DateQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    const feedItem = await this.feedService.getArtistFeedItem(params.id, ctx.userId, query);

    return {
      userId: ctx.userId,
      date: query.date,
      centralId: params.id,
      content: feedItem,
    };
  }
}
