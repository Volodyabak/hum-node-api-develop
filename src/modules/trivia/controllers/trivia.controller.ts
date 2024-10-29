import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { TriviaService } from '../services/trivia.service';
import { TriviaParamsDto } from '../dto/input/trivia.input';
import { formatGetTriviaResponse } from '../utils/trivia.utils';
import { ResCtx, ResponseContext } from '../../../decorators/response-context.decorator';
import { CreateTriviaDto } from '../dto/input/create-trivia.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('Trivia')
@Controller('trivia')
export class TriviaController {
  constructor(private readonly triviaService: TriviaService) {}

  @Post('')
  async createTrivia(@Body() body: CreateTriviaDto, @ResCtx() ctx: ResponseContext) {
    const trivia = await this.triviaService.createTrivia(ctx.userId, body);
    return formatGetTriviaResponse(trivia);
  }

  @Get('/user/me')
  async getUserTrivias(@ResCtx() ctx: ResponseContext) {
    const trivias = await this.triviaService.getUserTrivias(ctx.userId);
    return trivias.map((trivia) => formatGetTriviaResponse(trivia));
  }

  @Get('/:id')
  async getTriviaById(@Param() params: TriviaParamsDto) {
    const trivia = await this.triviaService.getTriviaById(params.id);
    return formatGetTriviaResponse(trivia);
  }
}
