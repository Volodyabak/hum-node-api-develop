import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { BrackhitsHomeService } from '../services/brackhits-home.service';
import {
  GetHomeBrackhitsParamsDto,
  GetHomeBrackhitsQueryDto,
  GetHomeBrackhitsResponseDto,
} from '../dto/brackhits-home.dto';
import { GetBrackhitAdsResponseDto } from '../api-dto/brackhits-api.dto';
import { BrackhitsService } from '../services/brackhits.service';

@Controller('home/brackhits')
@ApiTags('Brackhits Home')
@ApiBearerAuth()
export class BrackhitsHomeControllers {
  constructor(
    private readonly brackhitsService: BrackhitsService,
    private readonly brackhitsHomeService: BrackhitsHomeService,
  ) {}

  @Get('/ads')
  @ApiOperation({
    summary: 'Returns brackhit ads',
  })
  @ApiResponse({ status: 200, type: GetBrackhitAdsResponseDto })
  async getBrackhitAds(): Promise<GetBrackhitAdsResponseDto> {
    return this.brackhitsService.getBrackhitAds();
  }

  @Get('/')
  @ApiOperation({
    summary: 'Returns data for Brackhit Home screen',
    description:
      'Response contains home data and paginated array of category cards containing fixed number of items.' +
      '"categoryId" query param is used to get paginated array of brackhits for a category. ' +
      'If "categoryId" is not defined, then "skip" and "take" params will paginate an array of home items, ' +
      'otherwise an array of category items will be paginated. Pagination is not available for category items ' +
      'when "categoryId" is not defined, thus category properties "total" and "take" will be equal.',
  })
  @ApiResponse({
    status: 200,
    type: GetHomeBrackhitsResponseDto,
  })
  async getBrackhitsHome(
    @Query() query: GetHomeBrackhitsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetHomeBrackhitsResponseDto> {
    if (query.categoryId === undefined) {
      return this.brackhitsHomeService.getBrackhitsHomeResponse(ctx.userId, query);
    } else {
      return this.brackhitsHomeService.getBrackhitsHomeCategoryResponse(ctx.userId, query);
    }
  }

  @Get('/hubs/:hubId')
  @ApiOperation({
    summary: 'Returns category cards for Brackhit Hub screen, specified by hubId route param',
    description:
      'Response contains hub data and paginated array of category cards containing fixed number of items. ' +
      '"categoryId" query param is used to get paginated array of brackhits for a category. ' +
      'If "categoryId" is not defined, then "skip" and "take" params will paginate an array of hub items, ' +
      'otherwise an array of category items will be paginated. Pagination is not available for category items ' +
      'when "categoryId" is not defined, thus category properties "total" and "take" will be equal.',
  })
  @ApiResponse({
    status: 200,
    type: GetHomeBrackhitsResponseDto,
  })
  async getBrackhitsHub(
    @Param() params: GetHomeBrackhitsParamsDto,
    @Query() query: GetHomeBrackhitsQueryDto,
    @ResCtx() ctx: ResponseContext,
  ): Promise<GetHomeBrackhitsResponseDto> {
    if (query.categoryId === undefined) {
      return this.brackhitsHomeService.getBrackhitsHubResponse(ctx.userId, params.hubId, query);
    } else {
      return this.brackhitsHomeService.getBrackhitsHubCategoryResponse(
        ctx.userId,
        params.hubId,
        query,
      );
    }
  }
}
