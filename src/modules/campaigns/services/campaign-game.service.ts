import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { CampaignModel } from '@database/Models';
import { CAMPAIGN_ID_NAME, CAMPAIGN_TYPE_NAME } from '../constants/campaign.constants';
import { RepositoryService } from '../../repository/services/repository.service';
import { TriviaServiceV2 } from '../../trivia/services/trivia.service.v2';
import { ErrorConst } from '../../../constants';
import { formatTriviaResponse } from '../../games/utils/format-game.utils';

@Injectable()
export class CampaignGameService {
  constructor(
    private readonly repository: RepositoryService,
    @Inject(forwardRef(() => TriviaServiceV2))
    private readonly triviaService: TriviaServiceV2,
  ) {}

  async populateCampaignGame(campaign: CampaignModel) {
    const type = CAMPAIGN_ID_NAME[campaign.typeId];

    const populateMethods = {
      [CAMPAIGN_TYPE_NAME.Brackhit]: (campaignGame) => this.populateBrackhit(campaignGame['brackhitId']),
      [CAMPAIGN_TYPE_NAME.Ballot]: (campaignGame) => this.populateBallot(campaignGame['ballotId']),
      [CAMPAIGN_TYPE_NAME.Trivia]: (campaignGame) => this.populateTrivia(campaignGame['triviaId']),
    };

    const campaignGame = await this.findCampaignGame(type, campaign.id);
    if (campaignGame) {
      campaign[type.toLowerCase()] = await populateMethods[type](campaignGame);
    }
  }

  private async populateBrackhit(brackhitId: number) {
    // todo: send formatted response
    return this.repository.brackhitRepo.getBrackhitById(brackhitId);
  }
  private async populateBallot(ballotId: number) {
    // todo: send formatted response
    return this.repository.ballots.findBallot({ id: ballotId });
  }
  private async populateTrivia(id: string) {
    try {
      const trivia = await this.triviaService.findById(id);
      formatTriviaResponse(trivia);
      return trivia;
    } catch (err) {
      if (err.message === ErrorConst.TRIVIA_NOT_FOUND) {
        return null;
      }
    }
  }

  async linkGameToCampaign(type: CAMPAIGN_TYPE_NAME, campaignId: number, gameId: number | string) {
    const campaignGame = await this.findCampaignGame(type, campaignId);
    if (!campaignGame) {
      return this.createCampaignGame(type, campaignId, gameId);
    } else {
      return this.patchCampaignGame(type, campaignGame, gameId);
    }
  }

  private async findCampaignGame(type: CAMPAIGN_TYPE_NAME, campaignId: number) {
    const findMethods = {
      [CAMPAIGN_TYPE_NAME.Brackhit]: () => this.repository.campaign.findCampaignBrackhit({ campaignId }),
      [CAMPAIGN_TYPE_NAME.Ballot]: () => this.repository.campaign.findCampaignBallot({ campaignId }),
      [CAMPAIGN_TYPE_NAME.Trivia]: () => this.repository.trivia.findCampaignTrivia({ campaignId }),
    };

    return findMethods[type]();
  }

  private async createCampaignGame(
    type: CAMPAIGN_TYPE_NAME,
    campaignId: number,
    gameId: number | string,
  ) {
    const createMethods = {
      [CAMPAIGN_TYPE_NAME.Brackhit]: () => this.repository.campaign.insertCampaignBrackhit({ campaignId, brackhitId: gameId as number }),
      [CAMPAIGN_TYPE_NAME.Ballot]: () => this.repository.campaign.insertCampaignBallot({ campaignId, ballotId: gameId as number }),
      [CAMPAIGN_TYPE_NAME.Trivia]: () => this.repository.trivia.insertCampaignTrivia({ campaignId, triviaId: gameId as string }),
    };

    return createMethods[type]();
  }

  private async patchCampaignGame(
    type: CAMPAIGN_TYPE_NAME,
    campaignGame: any,
    gameId: number | string,
  ) {
    const patchMethods = {
      [CAMPAIGN_TYPE_NAME.Brackhit]: () => campaignGame.$query().patchAndFetch({ brackhitId: gameId as number }),
      [CAMPAIGN_TYPE_NAME.Ballot]: () => campaignGame.$query().patchAndFetch({ ballotId: gameId as number }),
      [CAMPAIGN_TYPE_NAME.Trivia]: () => campaignGame.$query().patchAndFetch({ triviaId: gameId as string }),
    };

    return patchMethods[type]();
  }
}
