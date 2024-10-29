import { Injectable } from '@nestjs/common';
import { RepositoryService } from '../../repository/services/repository.service';
import { CampaignService } from './campaign.service';
import { CAMPAIGN_TYPE_ID } from '../constants/campaign.constants';
import { CampaignGameUserService } from './campaign-game-user.service';
import { CampaignUserService } from './campaign-user.service';
import { MultipleChoicesRound, SingleChoiceRound, SubmitCampaignInput } from '../dto';
import { TriviaResultsService } from '../../trivia/services/trivia-results.service';

@Injectable()
export class CampaignSubmitService {
  constructor(
    private readonly repository: RepositoryService,
    private readonly campaignService: CampaignService,
    private readonly campaignUserService: CampaignUserService,
    private readonly campaignGameUserService: CampaignGameUserService,
    private readonly triviaResultsService: TriviaResultsService,
  ) {}

  // todo: figure out the return type: SubmitCampaignResponse
  async submit(campaignId: number, body: SubmitCampaignInput) {
    if (body.user.hasOwnProperty('confirmEmail')) {
      return;
    }

    const campaign = await this.campaignService.findById(campaignId);
    const score = await this.calculateScoreIfNeeded(campaign.typeId, body);

    const campaignUser = await this.campaignUserService.findOrCreateCampaignUser(
      campaignId,
      body.user,
    );
    await this.campaignUserService.linkUserToCampaign(campaignId, campaignUser.userId);

    const campaignUserContent = await this.campaignGameUserService.findOrCreateCampaignGameUser(
      campaignId,
      body.contentId,
      campaign.typeId,
      campaignUser,
      score,
    );

    await this.submitCampaignTypeSpecificLogic(campaign.typeId, campaignUserContent, body);

    return {
      user: campaignUser,
      answers: body.answers,
      score,
    };
  }

  private async calculateScoreIfNeeded(campaignTypeId: number, body: SubmitCampaignInput) {
    // todo: calculate score for other campaign types instead of getting it from the body
    if (campaignTypeId !== CAMPAIGN_TYPE_ID.Trivia) {
      return body.score || null;
    }

    return this.triviaResultsService.calculateTriviaScore(
      body.contentId as any,
      body.answers as SingleChoiceRound[],
    );
  }

  private async submitCampaignTypeSpecificLogic(
    campaignTypeId: CAMPAIGN_TYPE_ID,
    campaignUserContent: any,
    body: SubmitCampaignInput,
  ) {
    if (campaignTypeId === CAMPAIGN_TYPE_ID.Brackhit) {
      await this.submitBrackhitCampaign(campaignUserContent, body.answers as SingleChoiceRound[]);
    } else if (campaignTypeId === CAMPAIGN_TYPE_ID.Ballot) {
      await this.submitBallotCampaign(campaignUserContent, body.answers as MultipleChoicesRound[]);
    } else if (campaignTypeId === CAMPAIGN_TYPE_ID.Trivia) {
      await this.submitTriviaCampaign(campaignUserContent, body.answers as SingleChoiceRound[]);
    }
  }

  private async submitBrackhitCampaign(campaignUserContent: any, answers: SingleChoiceRound[]) {
    if (campaignUserContent.completions === 1) {
      await this.repository.campaign.insertCampaignUserBrackhitChoices(
        campaignUserContent.id,
        answers,
      );
    } else {
      await this.repository.campaign.updateCampaignUserBrackhitChoices(
        campaignUserContent.id,
        answers,
      );
    }
  }

  private async submitBallotCampaign(campaignUserContent: any, answers: MultipleChoicesRound[]) {
    await Promise.all(
      answers.map(async (answer) => {
        await Promise.all(
          answer.choices.map(async (choice) => {
            await this.repository.ballots.insertCampaignBallotUserChoice({
              campaignUserBallotId: campaignUserContent.id,
              roundId: answer.roundId,
              choiceId: choice.choiceId,
              voteRank: choice.voteRank,
            });
          }),
        );
      }),
    );
  }

  private async submitTriviaCampaign(campaignUserContent: any, answers: SingleChoiceRound[]) {
    await this.repository.trivia.deleteTriviaUserChoice({
      campaignUserTriviaId: campaignUserContent.id,
    });
    await Promise.all(
      answers.map((choice) =>
        this.repository.trivia.insertTriviaUserChoice({
          campaignUserTriviaId: campaignUserContent.id,
          roundId: choice.roundId,
          choiceId: choice.choiceId,
        }),
      ),
    );
  }
}
