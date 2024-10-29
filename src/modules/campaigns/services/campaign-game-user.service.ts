import { BadRequestException, Injectable } from '@nestjs/common';
import { CAMPAIGN_TYPE_ID } from '../constants/campaign.constants';
import { CampaignUserModel } from '@database/Models';
import { ErrorConst } from '../../../constants';
import { RepositoryService } from '../../repository/services/repository.service';

@Injectable()
export class CampaignGameUserService {
  constructor(private readonly repository: RepositoryService) {}

  async findOrCreateCampaignGameUser(
    campaignId: number,
    contentId: number | string,
    campaignType: CAMPAIGN_TYPE_ID,
    campaignUser: CampaignUserModel,
    score: number = null,
  ) {
    switch (campaignType) {
      case CAMPAIGN_TYPE_ID.Brackhit:
        return this.handleBrackhitCampaign(campaignId, contentId as number, campaignUser, score);

      case CAMPAIGN_TYPE_ID.Ballot:
        return this.handleBallotCampaign(campaignId, contentId as number, campaignUser);

      case CAMPAIGN_TYPE_ID.Trivia:
        return this.handleTriviaCampaign(campaignId, contentId as string, campaignUser, score);

      default:
        throw new BadRequestException(`Unsupported campaign type: ${campaignType}`);
    }
  }

  private async handleBrackhitCampaign(
    campaignId: number,
    contentId: number,
    campaignUser: CampaignUserModel,
    score: number,
  ) {
    const campaignBrackhit = await this.repository.campaign.findCampaignBrackhit({
      campaignId,
      brackhitId: contentId,
    });

    if (!campaignBrackhit) {
      throw new Error(ErrorConst.BRACKHIT_DOES_NOT_BELONGS_TO_CAMPAIGN);
    }

    let campaignUserContent = await this.repository.campaign.findCampaignUserBrackhit({
      campaignBrackhitId: campaignBrackhit.id,
      campaignUserId: campaignUser.userId,
    });

    if (campaignUserContent) {
      campaignUserContent = await campaignUserContent
        .$query()
        .patchAndFetch({ score, completions: campaignUserContent.completions + 1 });
    } else {
      campaignUserContent = await this.repository.campaign.insertCampaignUserBrackhit({
        campaignId,
        campaignBrackhitId: campaignBrackhit.id,
        campaignUserId: campaignUser.userId,
        score,
      });
    }

    return campaignUserContent;
  }

  private async handleBallotCampaign(
    campaignId: number,
    contentId: number,
    campaignUser: CampaignUserModel,
  ) {
    const campaignBallot = await this.repository.campaign.findCampaignBallot({
      campaignId,
      ballotId: contentId,
    });

    if (!campaignBallot) {
      throw new Error(ErrorConst.BALLOT_DOES_NOT_BELONGS_TO_CAMPAIGN);
    }

    const campaignUserContent = await this.repository.campaign.findCampaignUserBallot({
      campaignBallotId: campaignBallot.id,
      campaignUserId: campaignUser.userId,
    });

    if (campaignUserContent) {
      throw new Error(ErrorConst.USER_ALREADY_VOTED);
    }

    return this.repository.campaign.insertCampaignUserBallot({
      campaignId,
      campaignBallotId: campaignBallot.id,
      campaignUserId: campaignUser.userId,
    });
  }

  private async handleTriviaCampaign(
    campaignId: number,
    contentId: string,
    campaignUser: CampaignUserModel,
    score: number,
  ) {
    const campaignTrivia = await this.repository.trivia.findCampaignTrivia({
      campaignId,
      triviaId: contentId,
    });

    if (!campaignTrivia) {
      throw new Error(ErrorConst.TRIVIA_DOES_NOT_BELONGS_TO_CAMPAIGN);
    }

    let campaignUserContent = await this.repository.trivia.findCampaignUserTrivia({
      campaignId,
      campaignUserId: campaignUser.userId,
      campaignTriviaId: campaignTrivia.id,
    });

    const attempts = (campaignUserContent?.attempts || 0) + 1;

    if (campaignUserContent) {
      await this.repository.trivia.deleteTriviaUserChoice({
        campaignUserTriviaId: campaignUserContent.id,
      });
      campaignUserContent = await campaignUserContent.$query().patchAndFetch({ score, attempts });
    } else {
      campaignUserContent = await this.repository.trivia.insertCampaignUserTrivia({
        campaignId,
        campaignUserId: campaignUser.userId,
        campaignTriviaId: campaignTrivia.id,
        attempts,
        score,
      });
    }

    await this.repository.trivia.insertCampaignUserTriviaAttempt({
      campaignUserTriviaId: campaignUserContent.id,
      attempt: attempts,
      score,
    });

    return campaignUserContent;
  }
}
