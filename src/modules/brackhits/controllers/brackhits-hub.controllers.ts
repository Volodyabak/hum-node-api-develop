import { Controller, Get, HttpCode, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  BrackhitCardDto,
  BrackhitHubsCardDto,
  BrowseBrackhitsQueryDto,
  BrowseHubBrackhitsParamsDto,
} from '../dto/brackhits-hub.dto';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { BrackhitsHubService } from '../services/brackhits-hub.service';

@Controller('browse/brackhits')
@ApiTags('Brackhits Hub')
@ApiBearerAuth()
export class BrackhitsHubControllers {
  constructor(private readonly brackhitsHubService: BrackhitsHubService) {}

  @Get('/')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Returns data for brackhit home screen',
    description:
      'Returns home category and tags cards containing brackhits,' +
      'tag and category params are used to get all brackhits for specified card id',
  })
  @ApiResponse({ status: 200, isArray: true, type: BrackhitCardDto })
  async browseHomeBrackhits(
    @Query() query: BrowseBrackhitsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<any> {
    if (query.category) {
      return this.brackhitsHubService.getHomeCategoryCardFull(
        query.category,
        ctx.userId,
        query.date,
      );
    } else if (query.tag) {
      return this.brackhitsHubService.getHomeTagCardFull(query.tag, ctx.userId, query.date);
    } else {
      return this.brackhitsHubService.getBrackhitsHomeData(ctx.userId, query.date);
    }
  }

  @Get('/hubs/:hubId')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Returns data for brackhit hub screen',
    description:
      'Returns hub category and tags cards containing brackhits,' +
      'tag and category params are used to get all brackhits for specified card id',
  })
  @ApiResponse({
    status: 200,
    type: [BrackhitCardDto],
  })
  async browseHubBrackhits(
    @Param() params: BrowseHubBrackhitsParamsDto,
    @Query() query: BrowseBrackhitsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<BrackhitCardDto[]> {
    if (query.category) {
      return this.brackhitsHubService.getHubCategoryCardFull(
        query.category,
        params.hubId,
        ctx.userId,
        query.date,
      );
    } else if (query.tag) {
      return this.brackhitsHubService.getHubTagCardFull(
        query.tag,
        params.hubId,
        ctx.userId,
        query.date,
      );
    } else {
      return this.brackhitsHubService.getBrackhitsHubData(params.hubId, ctx.userId, query.date);
    }
  }

  @Get('/hubs')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Returns brackhit hubs cards',
  })
  @ApiResponse({ status: 200, type: BrackhitHubsCardDto })
  async getBrackhitHubs(): Promise<BrackhitHubsCardDto> {
    return this.brackhitsHubService.getBrackhitHubsAll();
  }
}
