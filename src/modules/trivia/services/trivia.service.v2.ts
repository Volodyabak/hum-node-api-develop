import { InjectModel } from '@nestjs/mongoose';
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { FlattenMaps, Model } from 'mongoose';
import { ErrorConst } from '../../../constants';
import { CommonQueryDto } from '../../../common/dto/query/query.dto';
import { CreateGameDto, QuestionDto, RoundDto } from '../dto/input/create.dto';
import { CAMPAIGN_TYPE_NAME } from '../../campaigns/constants/campaign.constants';
import { CampaignGameService } from '../../campaigns/services/campaign-game.service';
import { Trivia, TriviaDocument, TriviaQuestion } from '@database/mongodb';
import { GamesService } from '../../games/services/games.service';
import { findAllMongoQB } from '../../../common/query/filters';
import { ChoiceDto } from '../../../common/dto/games/choice.input.dto';

@Injectable()
export class TriviaServiceV2 {
  constructor(
    private readonly gamesService: GamesService,
    @Inject(forwardRef(() => CampaignGameService))
    private readonly campaignGameService: CampaignGameService,
    @InjectModel(Trivia.name) private readonly triviaModel: Model<TriviaDocument>,
  ) {}

  async findAll(query: CommonQueryDto): Promise<[Trivia[], number]> {
    const [trivias, count] = await Promise.all(
      findAllMongoQB<TriviaDocument, Trivia>(this.triviaModel, query),
    );
    return [trivias, count];
  }

  async findMyTrivias(userId: string, query: CommonQueryDto): Promise<[Trivia[], number]> {
    query.filters = { ...query.filters, ownerId: { $eq: userId } };
    return this.findAll(query);
  }

  async findById(id: string): Promise<FlattenMaps<TriviaDocument>> {
    const trivia = await this.triviaModel.findById(id).lean();

    if (!trivia) {
      throw new NotFoundException(ErrorConst.TRIVIA_NOT_FOUND);
    }

    return trivia;
  }

  async findOne(data: Partial<Trivia>) {
    const trivia = await this.triviaModel.findOne(data).lean();

    if (!trivia) {
      throw new NotFoundException(ErrorConst.TRIVIA_NOT_FOUND);
    }

    return trivia;
  }

  async create(userId: string, body: CreateGameDto, campaignId?: number) {
    const rounds = await this.processRounds(body.rounds);

    let trivia = new this.triviaModel({
      ...body,
      ownerId: userId,
      rounds,
    });

    trivia = await trivia.save();

    if (campaignId) {
      await this.campaignGameService.linkGameToCampaign(
        CAMPAIGN_TYPE_NAME.Trivia,
        campaignId,
        trivia.id,
      );
    }

    return trivia.toObject();
  }

  async delete(userId: string, id: string) {
    const trivia = await this.findById(id);

    if (trivia.ownerId !== userId) {
      throw new NotFoundException(ErrorConst.TRIVIA_DOES_NOT_BELONGS_TO_USER);
    }

    return this.triviaModel.findByIdAndDelete(id);
  }

  async populateTriviaContent(trivia: Trivia) {
    await Promise.all(
      trivia.rounds.map(async (round) => this.populateQuestionContent(round.question)),
    );
  }

  private async populateQuestionContent(question: TriviaQuestion) {
    await Promise.all(
      question.choices.map(async (choice) => {
        choice['content'] = await this.gamesService.populateChoiceContent(choice);
      }),
    );
  }

  private async processRounds(rounds: RoundDto[]): Promise<RoundDto[]> {
    return await Promise.all(
      rounds.map(async (round) => ({
        ...round,
        question: await this.processQuestion(round.question),
      })),
    );
  }

  private async processQuestion(question: QuestionDto): Promise<QuestionDto> {
    const choices = await this.gamesService.saveChoices(question.choices);

    question.resolve.choiceIds = choices
      .filter((choice) => choice.isCorrect)
      .map((choice) => choice.choiceId);

    return { ...question, choices };
  }
}
