import { Injectable } from '@nestjs/common';
import { BrackhitChallengesModel } from '../../../../database/Models';
import { JoinOperation, PaginatedItems } from '../../../Tools/dto/util-classes';
import { QueryBuilderUtils } from '../../../Tools/utils/query-builder.utils';
import { Relations } from '../../../../database/relations/relations';
import { Utils } from '../../../Tools/utils/utils';
import {
  CreateBrackhitChallengeBodyDto,
  GetChallengeQueryDto,
  GetChallengeResponseDto,
} from '../api-dto/brackhits-challenges-api.dto';
import { ChallengeBrackhitDto } from '../dto/brackhits-challenges.dto';
import { AppEventsEmitter } from '../../app-events/app-events.emitter';
import { AppEventName } from '../../app-events/app-events.types';
import { RepositoryService } from '../../repository/services/repository.service';
import { expr } from '../../../../database/relations/relation-builder';

@Injectable()
export class BrackhitsChallengesService {
  constructor(
    private readonly appEventsEmitter: AppEventsEmitter,
    private readonly repositoryService: RepositoryService,
  ) {}

  async getActiveChallenges(date: Date): Promise<BrackhitChallengesModel[]> {
    return this.repositoryService.brackhitChallengeRepo
      .getActiveChallenges(date)
      .select('bc.*', 'g.genreName')
      .leftJoinRelated(expr([Relations.Genre, 'g']));
  }

  async getBrackhitChallenge(
    id: number,
    query: GetChallengeQueryDto,
  ): Promise<GetChallengeResponseDto> {
    const challenge = await this.repositoryService.brackhitChallengeRepo.getChallenge({
      id,
    });
    const leaderboard = await this.getChallengeLeaderboard(challenge, query);

    return {
      challenge,
      skip: leaderboard.skip,
      take: leaderboard.take,
      total: leaderboard.total,
      leaderboard: leaderboard.items,
    };
  }

  async getChallengeWinner(challenge: BrackhitChallengesModel): Promise<ChallengeBrackhitDto> {
    const leaderboard = await this.getChallengeLeaderboard(challenge, {
      skip: 0,
      take: 1,
    });

    return leaderboard.items[0];
  }

  async getChallengeLeaderboard(
    challenge: BrackhitChallengesModel,
    query: GetChallengeQueryDto,
  ): Promise<PaginatedItems<ChallengeBrackhitDto>> {
    const leaderboardQB = this.repositoryService.brackhitChallengeRepo.getChallengeLeaderboard(
      challenge.genreId,
      challenge.startDate,
      challenge.endDate,
    );
    const totalQB = leaderboardQB.clone();

    leaderboardQB
      .select('b.brackhitId', 'b.name', 'b.thumbnail', 'b.timeLive', 'comp.completions')
      .orderBy('comp.completions', 'desc')
      .orderBy('b.brackhitId', 'desc');

    QueryBuilderUtils.addPaginationToBuilder(leaderboardQB, query);
    QueryBuilderUtils.fetchRelationsToBuilder(leaderboardQB, [
      {
        relation: Relations.Owner,
        alias: 'upi',
        select: ['upi.userId', 'upi.username', 'upi.userImage', 'ui.typeId as influencerType'],
        children: [
          {
            relation: expr([Relations.UserInfluencer, 'ui']),
            join: JoinOperation.leftJoin,
          },
        ],
      },
    ]);

    const [leaderboard, total] = await Promise.all([
      leaderboardQB.castTo<ChallengeBrackhitDto[]>(),
      totalQB.resultSize(),
    ]);

    Utils.addRankByFieldNameToItems(leaderboard, 'completions');

    return {
      skip: query.skip,
      take: query.take,
      total,
      items: leaderboard,
    };
  }

  async createChallenge(body: CreateBrackhitChallengeBodyDto): Promise<BrackhitChallengesModel> {
    const challenge = await this.repositoryService.brackhitChallengeRepo.saveChallenge({
      ...body,
    });

    this.appEventsEmitter.emit(AppEventName.CREATE_BRACKHIT_CHALLENGE, {
      challengeId: challenge.id,
      endDate: challenge.endDate,
    });

    return challenge;
  }
}
