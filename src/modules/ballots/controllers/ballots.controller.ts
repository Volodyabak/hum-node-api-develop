import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';

import { BallotsService } from '../services/ballots.service';
import { BallotIdParam, BallotRestQueryColumns, PostBallotDto } from '../dto';
import { CampaignIdDto } from '../../campaigns/dto/campaign.dto';
import { formatGetBallotResponse } from '../utils/ballot-response.util';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { PaginationQueryDto } from '../../../Tools/dto/main-api.dto';
import { RestfulQuery, RestQuery } from '../../../decorators/restful-query.decorator';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@Controller('ballots')
@ApiTags('Ballots')
export class BallotsController {
  constructor(private readonly ballotsService: BallotsService) {}

  @Get()
  @ApiOperation({
    summary: 'Returns ballots filtered by input criteria',
    description:
      'Filtering is performed by query params in RHS colon style which have such structure: ' +
      '[columnName]__[SQLOperator]=[value]. List of all SQL operators is available by this link ' +
      'https://www.npmjs.com/package/restful-filter',
  })
  async getBallots(
    @RestQuery(BallotRestQueryColumns) restfullQuery: RestfulQuery,
    @Query() paginationQuery: PaginationQueryDto,
  ) {
    return this.ballotsService.getBallots(restfullQuery);
  }

  @Post()
  async createBallot(@Body() body: PostBallotDto, @ResCtx() ctx: ResponseContext) {
    const { ballot, campaign } = await this.ballotsService.createBallot(ctx.userId, body);
    return formatGetBallotResponse(ballot, campaign);
  }

  @Get('/:ballotId')
  async getBallot(@Param() params: BallotIdParam, @Query() query: CampaignIdDto) {
    const { ballot, campaign } = await this.ballotsService.getBallot(
      params.ballotId,
      query.campaignId,
    );

    return formatGetBallotResponse(ballot, campaign);
  }

  @Get('/:ballotId/summary')
  async getBallotSummary(@Param() params: BallotIdParam, @Query() query: CampaignIdDto) {
    return this.ballotsService.getBallotSummary(params.ballotId, query.campaignId);
  }
}
