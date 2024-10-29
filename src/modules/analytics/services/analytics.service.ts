import { BadRequestException, Injectable } from '@nestjs/common';
import {
  BrackhitCreationBodyDto,
  BrackhitPreviewBodyDto,
  BrackhitUserHomeBodyDto,
  CreateBrackhitBtnBodyDto,
  FeedScrollBodyDto,
  LogArtistViewBodyDto,
  LogBottomNavigationDto,
  LogBrackhitCompareDto,
  LogBrackhitVisitDto,
  LogContentBodyDto,
  LogNewsArticleDto,
  LogProfileViewDto,
  LogScreenshotDto,
  LogSpotifyTrackDto,
  MyBrackhitBodyDto,
  UpdateContentLogBodyDto,
  UpdateNewsArticleLogBodyDto,
} from '../dto/analytics.dto';
import {
  LogArtistProfileModel,
  LogArtistSearchesModel,
  LogBrackhitCreateButtonModel,
  LogBrackhitCreationModel,
  LogBrackhitDownloadModel,
  LogBrackhitPreviewModel,
  LogBrackhitUserHomeModel,
  LogBrackhitVisitsModel,
  LogChallengesModel,
  LogCompareModel,
  LogContentModel,
  LogFeedItemsModel,
  LogHubsModel,
  LogNewsitemModel,
  LogProfileVisitsModel,
  LogScreenshotModel,
  LogShareModel,
  LogSpotifySigninSkipModel,
  LogSpotifyTrackModel,
  LogUpdateModel,
  LogUserNavModel,
  LogYoutubeVideoModel,
} from '../../../../database/Models';
import { ErrorConst } from '../../../constants';
import { HUB_SCREEN_IDS, InteractionTypes, TAG_SCREEN_IDS } from '../constants';
import { RepositoryService } from '../../repository/services/repository.service';
import { NotFoundError } from '../../../Errors';

@Injectable()
export class AnalyticsService {
  constructor(private readonly repoService: RepositoryService) {}

  async logArtistView(userId: string, body: LogArtistViewBodyDto): Promise<LogArtistProfileModel> {
    return this.repoService.analyticsRepo.saveArtistViewLog({ userId, ...body });
  }

  async logSpotifyTrack(userId: string, body: LogSpotifyTrackDto): Promise<LogSpotifyTrackModel> {
    if (body.brackhitId && !body.roundId) {
      throw new BadRequestException(ErrorConst.BOTH_BRACKHIT_ID_AND_ROUND_ID_REQUIRED);
    }

    if (body.roundId && !body.brackhitId) {
      throw new BadRequestException(ErrorConst.BOTH_BRACKHIT_ID_AND_ROUND_ID_REQUIRED);
    }

    return this.repoService.analyticsRepo.saveSpotifyTrackLog({
      userId,
      trackKey: body.trackKey,
      trackPreview: body.preview,
      brackhitId: body.brackhitId,
      roundId: body.roundId,
    });
  }

  async logYoutubeVideo(userId: string, videoKey: string): Promise<LogYoutubeVideoModel> {
    return this.repoService.analyticsRepo.saveYoutubeVideoLog({ userId, videoKey });
  }

  async logProfileView(userId: string, body: LogProfileViewDto): Promise<LogProfileVisitsModel> {
    return this.repoService.analyticsRepo.saveProfileViewLog({
      userId,
      userViewed: body.viewedUserKey,
      screenId: body.screenId,
    });
  }

  async logSpotifySignInSkip(userId: string): Promise<LogSpotifySigninSkipModel> {
    const log = await LogSpotifySigninSkipModel.query().findOne({ userId });

    if (log) {
      throw new BadRequestException(ErrorConst.RECORD_ALREADY_EXISTS);
    }

    return this.repoService.analyticsRepo.saveSpotifySkipLog({ userId });
  }

  async logBottomNavigation(
    userId: string,
    body: LogBottomNavigationDto,
  ): Promise<LogUserNavModel> {
    return this.repoService.analyticsRepo.saveBottomNavLog({
      userId,
      itemType: body.itemType,
      appOpen: body.app_open,
    });
  }

  async logBrackhitVisit(
    userId: string,
    body: LogBrackhitVisitDto,
  ): Promise<LogBrackhitVisitsModel> {
    if (!HUB_SCREEN_IDS.includes(body.screenId) && body.hubId !== undefined) {
      throw new BadRequestException(ErrorConst.WRONG_SCREEN_ID_HUB_ID_COMBINATION);
    }

    if (!TAG_SCREEN_IDS.includes(body.screenId) && body.tagId !== undefined) {
      throw new BadRequestException(ErrorConst.WRONG_SCREEN_ID_HUB_ID_COMBINATION);
    }

    return this.repoService.analyticsRepo.saveBrackhitVisitLog({
      userId,
      ...body,
    });
  }

  async logAppUpdate(userId: string, version?: string): Promise<LogUpdateModel> {
    return this.repoService.analyticsRepo.saveUpdateLog({ userId, version });
  }

  async logShareBrackhit(userId: string, brackhitId?: number): Promise<LogShareModel> {
    return this.repoService.analyticsRepo.saveShareLog({ userId, brackhitId });
  }

  async logScreenshot(userId: string, body: LogScreenshotDto): Promise<LogScreenshotModel> {
    if (body.screenId === 1 && !body.brackhitId) {
      throw new BadRequestException(ErrorConst.BRACKHIT_ID_REQUIRED_FOR_GIVEN_SCREEN_ID);
    }

    return this.repoService.analyticsRepo.saveScreenshotLog({ userId, ...body });
  }

  async logBrackhitCompare(userId: string, body: LogBrackhitCompareDto): Promise<LogCompareModel> {
    return this.repoService.analyticsRepo.saveCompareLog({
      userId,
      ...body,
    });
  }

  async logBrackhitHubs(userId: string, hubId: number): Promise<LogHubsModel> {
    return this.repoService.analyticsRepo.saveHubsLog({ userId, hubId });
  }

  async logNewsArticle(userId: string, body: LogNewsArticleDto): Promise<LogNewsitemModel> {
    return this.repoService.analyticsRepo.saveNewsArticleLog({
      userId,
      ...body,
    });
  }

  async updateNewsArticleLog(
    id: number,
    body: UpdateNewsArticleLogBodyDto,
  ): Promise<LogNewsitemModel> {
    return this.repoService.analyticsRepo.updateNewsArticleLog(id, body);
  }

  async logChallenge(challengeId: number, userId: string): Promise<LogChallengesModel> {
    return this.repoService.analyticsRepo.saveChallengeLog({ challengeId, userId });
  }

  async logArtistSearch(query: string, userId: string): Promise<LogArtistSearchesModel> {
    return this.repoService.analyticsRepo.saveArtistSearchLog({ query, userId });
  }

  async logBrackhitCreation(
    body: BrackhitCreationBodyDto,
    userId: string,
  ): Promise<LogBrackhitCreationModel> {
    return this.repoService.analyticsRepo.saveBrackhitCreationLog({ userId, ...body });
  }

  async logBrackhitDownload(
    body: MyBrackhitBodyDto,
    userId: string,
  ): Promise<LogBrackhitDownloadModel> {
    return this.repoService.analyticsRepo.saveBrackhitDownloadLog({ userId, ...body });
  }

  async logMakeBrackhit(
    body: CreateBrackhitBtnBodyDto,
    userId: string,
  ): Promise<LogBrackhitCreateButtonModel> {
    return this.repoService.analyticsRepo.saveMakeBrackhitLog({
      userId,
      ...body,
    });
  }

  async logBrackhitPreview(
    body: BrackhitPreviewBodyDto,
    userId: string,
  ): Promise<LogBrackhitPreviewModel> {
    return this.repoService.analyticsRepo.saveBrackhitPreviewLog({
      userId,
      ...body,
    });
  }

  async logBrackhitUserHome(
    body: BrackhitUserHomeBodyDto,
    userId: string,
  ): Promise<LogBrackhitUserHomeModel> {
    return this.repoService.analyticsRepo.saveBrackhitUserHomeLog({
      userId,
      ...body,
    });
  }

  async logFeedScroll(body: FeedScrollBodyDto, userId: string): Promise<LogFeedItemsModel> {
    return this.repoService.analyticsRepo.saveFeedScrollLog({
      userId,
      ...body,
    });
  }

  async logContent(userId: string, body: LogContentBodyDto): Promise<LogContentModel> {
    if (body.interactionId === InteractionTypes.Like) {
      const like = await this.repoService.analyticsRepo.findContentLog({
        userId,
        ...body,
      });

      if (like) {
        return like;
      }
    }

    return this.repoService.analyticsRepo.saveContentLog({
      userId,
      ...body,
    });
  }

  async updateContentLog(id: number, body: UpdateContentLogBodyDto): Promise<LogContentModel> {
    return this.repoService.analyticsRepo.updateContentLog(id, body);
  }

  async deleteContentLog(id: number, userId: string): Promise<number> {
    const log = await this.repoService.analyticsRepo.getContentLogById(id);

    if (!log) {
      throw new NotFoundError(ErrorConst.RECORD_DOES_NOT_EXIST);
    }

    if (log.interactionId !== InteractionTypes.Like) {
      throw new BadRequestException('Only records with interaction id = 3 can be deleted');
    }

    if (log.userId !== userId) {
      throw new BadRequestException(ErrorConst.USER_IS_NOT_OWNER);
    }

    return this.repoService.analyticsRepo.deleteContentLog(id);
  }
}
