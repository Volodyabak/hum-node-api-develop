import { BrackhitModel } from '../../../../database/Models/BrackhitModel';
import {
  BrackhitArtistDto,
  HotTakeDto,
  HotTakeMetaDto,
  SuggestedBrackhitDto,
} from '../dto/brackhits.dto';
import { BrackhitsUtils } from '../utils/brackhits.utils';
import { BrackhitMetaDto } from '../dto/brackhits-home.dto';
import { BrackhitMatchupsModel } from '../../../../database/Models/BrackhitMatchupsModel';
import { CampaignBrackhitWinner } from '../../campaigns/interfaces/campaign.interfaces';
import { CampaignUserBrackhitModel } from '../../../../database/Models/campaign';

export class BrackhitsParser {
  static parseBrackhitArtistDto(
    brackhits: BrackhitModel[],
    userId: string,
    date: Date,
  ): BrackhitArtistDto[] {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      name: b.name,
      description: b.description,
      ownerId: b.ownerId,
      timeLive: b.timeLive,
      duration: b.duration,
      size: b.size,
      thumbnail: b.thumbnail,
      url: b.url,
      type: b.type,
      scoringState: b.scoringState,
      displaySeeds: b.displaySeeds,
      isLive: BrackhitsUtils.isLiveBrackhit(b, date),
      userStatus: BrackhitsUtils.identifyUserBrackhitStatus(b),
    }));
  }

  static parseBrackhitHotTakes(hotTakes: HotTakeMetaDto[]): HotTakeDto[] {
    return hotTakes.map((el) => ({
      brackhitId: el.brackhitId,
      name: el.name,
      roundId: el.roundId,
      firstChoice: el.firstChoice,
      secondChoice: el.secondChoice,
      user: {
        userId: el.userId,
        username: el.username,
        userImage: el.userImage,
      },
    }));
  }

  static parseSuggestedBrackhits(
    brackhits: BrackhitMetaDto[],
    userTime: Date,
  ): SuggestedBrackhitDto[] {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      name: b.name,
      thumbnail: b.thumbnail,
      isLive: BrackhitsUtils.isLiveBrackhit(b, userTime),
      userStatus: BrackhitsUtils.identifyUserBrackhitStatus(b),
    }));
  }

  static parseSearchedBrackhits(brackhits: BrackhitModel[], date: Date) {
    return brackhits.map((b) => ({
      brackhitId: b.brackhitId,
      name: b.name,
      description: b.description,
      ownerId: b.ownerId,
      timeLive: b.timeLive,
      duration: b.duration,
      size: b.size,
      thumbnail: b.thumbnail,
      url: b.url,
      type: b.type,
      scoringState: b.scoringState,
      displaySeeds: b.displaySeeds,
      thirdPlace: b.thirdPlace,
      startingRound: b.startingRound,
      isLive: BrackhitsUtils.isLiveBrackhit(b, date),
      userStatus: BrackhitsUtils.identifyUserBrackhitStatus(b),
    }));
  }

  static parseCampaignBrackhitMeta(el: any) {
    return {
      choiceId: el.choiceId,
      roundId: el.roundId,
      name: el.brackhitContent?.track?.trackName,
      artists: el.brackhitContent?.track?.artists?.map((el) => el?.artistName).join(', '),
      votes: el.votes,
    };
  }

  static parseCampaignBrackhitWinners(el: Partial<BrackhitMatchupsModel>): CampaignBrackhitWinner {
    return {
      brackhitId: el.brackhitId,
      roundId: el.roundId,
      choiceId: el.choiceId,
      name: el.brackhitContent?.track?.trackName,
      artists: el.brackhitContent?.track?.artists?.map((el) => el.artistName).join(', '),
      votes: el.votes,
      percent: el.percent,
    };
  }
}
