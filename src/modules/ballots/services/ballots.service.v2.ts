import { Injectable, NotFoundException } from '@nestjs/common';
import { Model } from 'mongoose';
import { Ballot, BallotDocument, BallotRound, BallotRoundVoteType } from '@database/mongodb';
import { CommonQueryDto } from '../../../common/dto/query/query.dto';
import { ErrorConst } from '../../../constants';
import { BallotRoundDto, CreateBallotDto } from '../dto';
import { CAMPAIGN_TYPE_NAME } from '../../campaigns/constants/campaign.constants';
import { GamesService } from '../../games/services/games.service';
import { CalculationsService } from '../../games/services/calculations.service';
import { CampaignGameService } from '../../campaigns/services/campaign-game.service';
import { InjectModel } from '@nestjs/mongoose';
import { RepositoryService } from '../../repository/services/repository.service';
import { findAllMongoQB } from '../../../common/query/filters';

@Injectable()
export class BallotsServiceV2 {
  constructor(
    private readonly repository: RepositoryService,
    private readonly gamesService: GamesService,
    private readonly calculationsService: CalculationsService,
    private readonly campaignGameService: CampaignGameService,
    @InjectModel(Ballot.name) private readonly ballotModel: Model<BallotDocument>,
  ) {}

  async findAll(query: CommonQueryDto): Promise<[Ballot[], number]> {
    const [ballots, count] = await Promise.all(
      findAllMongoQB<BallotDocument, Ballot>(this.ballotModel, query),
    );
    return [ballots, count];
  }

  async findById(id: string) {
    const ballot = await this.ballotModel.findById(id).lean();

    if (!ballot) {
      throw new NotFoundException(ErrorConst.BALLOT_NOT_FOUND);
    }

    return ballot;
  }

  async create(userId: string, body: CreateBallotDto, campaignId?: number) {
    const rounds = await this.processRounds(body.rounds);

    let ballot = await this.ballotModel.create({
      ...body,
      ownerId: userId,
      rounds: rounds,
    });

    ballot = await ballot.save();

    if (campaignId) {
      await this.campaignGameService.linkGameToCampaign(
        CAMPAIGN_TYPE_NAME.Ballot,
        campaignId,
        ballot.ballotId,
      );
    }

    return ballot.toObject();
  }

  async delete(userId: string, id: string) {
    const ballot = await this.findById(id);

    if (ballot.ownerId !== userId) {
      throw new NotFoundException(ErrorConst.BALLOT_DOES_NOT_BELONGS_TO_USER);
    }

    return this.ballotModel.findByIdAndDelete(id);
  }

  async getBallotResults(ballotId: string, campaignId: number) {
    const [ballot, campaign] = await Promise.all([
      this.findById(ballotId),
      this.repository.campaign.findCampaign({ id: campaignId }),
    ]);

    if (!campaign) {
      throw new NotFoundException(ErrorConst.CAMPAIGN_NOT_FOUND);
    }

    const [winnerMap, totalVotes] = await Promise.all([
      this.calculationsService.calculateBallotResults(ballot, campaignId),
      this.repository.ballots.getBallotTotalVotes(ballot.ballotId, campaignId),
    ]);

    ballot['totalVotes'] = totalVotes;
    ballot.rounds.forEach((round) => {
      round['winners'] = round.choices
        .filter((choice) => winnerMap.get(round.roundId).has(choice.choiceId))
        .map((choice) => {
          const votes = winnerMap.get(round.roundId).get(choice.choiceId);
          const prop = round.votingType === BallotRoundVoteType.Ranked ? 'bordaCount' : 'votes';

          return { ...choice, [prop]: votes.votes };
        });

      delete round.choices;
    });

    return ballot;
  }

  async populateBallotContent(ballot: Ballot) {
    await Promise.all(ballot.rounds.map(async (round) => this.populateRoundContent(round)));
  }

  private async populateRoundContent(round: BallotRound) {
    await Promise.all(
      round.choices.map(async (choice) => {
        choice['content'] = await this.gamesService.populateChoiceContent(choice);
      }),
    );
  }

  private async processRounds(rounds: BallotRoundDto[]) {
    return Promise.all(
      rounds.map(async (round) => ({
        ...round,
        choices: await this.gamesService.saveChoices(round.choices),
      })),
    );
  }
}
