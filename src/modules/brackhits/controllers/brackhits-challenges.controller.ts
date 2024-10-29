import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  CreateBrackhitChallengeBodyDto,
  GetBrackhitChallengesResponseDto,
  GetChallengeQueryDto,
  GetChallengeResponseDto,
} from '../api-dto/brackhits-challenges-api.dto';
import { DateQueryDto, IdParamDto } from '../../../Tools/dto/main-api.dto';
import { BrackhitChallengesModel } from '../../../../database/Models';
import { BrackhitsChallengesService } from '../services/brackhits-challenges.service';

@Controller('brackhits/challenges')
@ApiTags('Brackhits Challenges')
@ApiBearerAuth()
export class BrackhitsChallengesController {
  constructor(private readonly brackhitsChallengesService: BrackhitsChallengesService) {}

  @Post('/')
  @ApiOperation({
    summary: 'Creates brackhit challenge',
  })
  @ApiResponse({ status: 200, type: BrackhitChallengesModel })
  async createChallenge(
    @Body() body: CreateBrackhitChallengeBodyDto,
  ): Promise<BrackhitChallengesModel> {
    return this.brackhitsChallengesService.createChallenge(body);
  }

  @Get('/')
  @ApiOperation({
    summary: 'Returns active brackhit challenges',
  })
  @ApiResponse({ status: 200, type: GetBrackhitChallengesResponseDto })
  async getChallenges(@Query() query: DateQueryDto): Promise<GetBrackhitChallengesResponseDto> {
    const challenges = await this.brackhitsChallengesService.getActiveChallenges(query.date);

    return {
      challenges,
    };
  }

  @Get('/:id')
  @ApiOperation({
    summary: 'Returns brackhit challenge and leaderboard',
  })
  @ApiResponse({ status: 200, type: GetChallengeResponseDto })
  async getChallengeById(
    @Param() param: IdParamDto,
    @Query() query: GetChallengeQueryDto,
  ): Promise<GetChallengeResponseDto> {
    return this.brackhitsChallengesService.getBrackhitChallenge(param.id, query);
  }
}
