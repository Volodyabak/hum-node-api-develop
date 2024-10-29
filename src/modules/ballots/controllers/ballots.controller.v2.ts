import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CommonQueryDto } from '../../../common/dto/query/query.dto';
import { CreateBallotDto } from '../dto';
import { CampaignIdDto } from '../../campaigns/dto/campaign.dto';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { BallotsServiceV2 } from '../services/ballots.service.v2';

@Controller('/v2/ballots')
@ApiTags('Ballots v2')
export class BallotsControllerV2 {
  constructor(private readonly ballotsService: BallotsServiceV2) {}

  @Get('')
  async findAll(@Query() query: CommonQueryDto) {
    const [ballots, count] = await this.ballotsService.findAll(query);

    await Promise.all(
      ballots.map(async (ballot) => this.ballotsService.populateBallotContent(ballot)),
    );

    return {
      data: ballots,
      meta: {
        pagination: {
          page: query.pagination.page,
          pageSize: query.pagination.pageSize,
          pageCount: Math.ceil(+count / query.pagination.pageSize),
          total: count,
        },
      },
    };
  }

  @Post('')
  async create(
    @Body() body: CreateBallotDto,
    @Query() query: CampaignIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    const ballot = await this.ballotsService.create(ctx.userId, body, query.campaignId);
    await this.ballotsService.populateBallotContent(ballot);
    return { data: ballot };
  }

  @Get('/:id')
  async findById(@Param('id') id: string) {
    const ballot = await this.ballotsService.findById(id);
    await this.ballotsService.populateBallotContent(ballot);
    return { data: ballot };
  }

  @Get('/:id/summary')
  async getResults(@Param('id') id: string, @Query() query: CampaignIdDto) {
    const ballot = await this.ballotsService.getBallotResults(id, query.campaignId);
    return { data: ballot };
  }

  @Delete('/:id')
  async deleteById(@Param('id') id: string, @ResCtx() ctx: ResponseContext) {
    const ballot = await this.ballotsService.delete(ctx.userId, id);
    return { data: ballot };
  }
}
