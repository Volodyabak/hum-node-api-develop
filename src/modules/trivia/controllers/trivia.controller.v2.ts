import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CommonQueryDto } from '../../../common/dto/query/query.dto';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { CreateGameDto } from '../dto/input/create.dto';
import { CampaignIdDto } from '../../campaigns/dto/campaign.dto';
import { TriviaServiceV2 } from '../services/trivia.service.v2';
import { formatTriviaResponse } from '../../games/utils/format-game.utils';

@ApiBearerAuth()
@ApiTags('Trivia v2')
@Controller('/v2/trivias')
export class TriviaControllerV2 {
  constructor(private readonly triviaService: TriviaServiceV2) {}

  @Get('')
  @ApiOperation({ summary: 'Get a paginated list of trivias' })
  async findAll(@Query() query: CommonQueryDto) {
    const [trivias, total] = await this.triviaService.findAll(query);

    await Promise.all(
      trivias.map(async (trivia) => {
        await this.triviaService.populateTriviaContent(trivia);
        formatTriviaResponse(trivia);
      }),
    );

    return {
      data: trivias,
      meta: {
        pagination: {
          page: query.pagination.page,
          pageSize: query.pagination.pageSize,
          pageCount: Math.ceil(+total / query.pagination.pageSize),
          total,
        },
      },
    };
  }

  @Post('/')
  async create(
    @Body() body: CreateGameDto,
    @Query() query: CampaignIdDto,
    @ResCtx() ctx: ResponseContext,
  ) {
    const trivia = await this.triviaService.create(ctx.userId, body, query.campaignId);
    await this.triviaService.populateTriviaContent(trivia);
    formatTriviaResponse(trivia);
    return { data: trivia };
  }

  @Get('/users/me')
  async findMyTrivias(@Query() query: CommonQueryDto, @ResCtx() ctx: ResponseContext) {
    const [trivias, count] = await this.triviaService.findMyTrivias(ctx.userId, query);

    await Promise.all(
      trivias.map(async (trivia) => {
        await this.triviaService.populateTriviaContent(trivia);
        formatTriviaResponse(trivia);
      }),
    );

    return {
      data: trivias,
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

  @Get('/:id')
  async findById(@Param('id') id: string) {
    const trivia = await this.triviaService.findById(id);
    await this.triviaService.populateTriviaContent(trivia);
    formatTriviaResponse(trivia);
    return { data: trivia };
  }

  @Delete('/:id')
  async deleteById(@Param('id') id: string, @ResCtx() ctx: ResponseContext) {
    const trivia = await this.triviaService.delete(ctx.userId, id);
    return { data: trivia };
  }
}
