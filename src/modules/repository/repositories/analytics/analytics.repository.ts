import { Injectable } from '@nestjs/common';
import { PartialModelObject, Transaction } from 'objection';
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
  LogDeletedUsersModel,
  LogFeedItemsModel,
  LogHubsModel,
  LogNewsitemModel,
  LogProfileVisitsModel,
  LogScreenshotModel,
  LogShareModel,
  LogSpotifySigninSkipModel,
  LogSpotifyTrackModel,
  LogUpdateModel,
  LogUserBrackhitPushrecModel,
  LogUserNavModel,
  LogYoutubeVideoModel,
} from '../../../../../database/Models';

@Injectable()
export class AnalyticsRepository {
  saveArtistViewLog(data: PartialModelObject<LogArtistProfileModel>) {
    return LogArtistProfileModel.query().insertAndFetch(data);
  }

  saveBottomNavLog(data: PartialModelObject<LogUserNavModel>) {
    return LogUserNavModel.query().insertAndFetch(data);
  }

  saveBrackhitVisitLog(data: PartialModelObject<LogBrackhitVisitsModel>) {
    return LogBrackhitVisitsModel.query().insertAndFetch(data);
  }

  saveCompareLog(data: PartialModelObject<LogCompareModel>) {
    return LogCompareModel.query().insertAndFetch(data);
  }

  saveHubsLog(data: PartialModelObject<LogHubsModel>) {
    return LogHubsModel.query().insertAndFetch(data);
  }

  findLastOpenedNewsArticleLog(userId: string, newsitemId: number) {
    return LogNewsitemModel.query()
      .where({ userId, newsitemId, closedAt: null })
      .orderBy('timestamp', 'desc')
      .first();
  }

  saveNewsArticleLog(data: PartialModelObject<LogNewsitemModel>) {
    return LogNewsitemModel.query().insertAndFetch(data);
  }

  updateNewsArticleLog(id: number, data: PartialModelObject<LogNewsitemModel>) {
    return LogNewsitemModel.query().updateAndFetchById(id, data);
  }

  saveProfileViewLog(data: PartialModelObject<LogProfileVisitsModel>) {
    return LogProfileVisitsModel.query().insertAndFetch(data);
  }

  saveScreenshotLog(data: PartialModelObject<LogScreenshotModel>) {
    return LogScreenshotModel.query().insertAndFetch(data);
  }

  saveShareLog(data: PartialModelObject<LogShareModel>) {
    return LogShareModel.query().insertAndFetch(data);
  }

  saveSpotifySkipLog(data: PartialModelObject<LogSpotifySigninSkipModel>) {
    return LogSpotifySigninSkipModel.query().insertAndFetch(data);
  }

  saveSpotifyTrackLog(data: PartialModelObject<LogSpotifyTrackModel>) {
    return LogSpotifyTrackModel.query().insert(data);
  }

  saveUpdateLog(data: PartialModelObject<LogUpdateModel>) {
    return LogUpdateModel.query().insertAndFetch(data);
  }

  saveYoutubeVideoLog(data: PartialModelObject<LogYoutubeVideoModel>) {
    return LogYoutubeVideoModel.query().insertAndFetch(data);
  }

  saveChallengeLog(data: PartialModelObject<LogChallengesModel>) {
    return LogChallengesModel.query().insertAndFetch(data);
  }

  saveArtistSearchLog(data: PartialModelObject<LogArtistSearchesModel>) {
    return LogArtistSearchesModel.query().insertAndFetch(data);
  }

  saveBrackhitCreationLog(data: PartialModelObject<LogBrackhitCreationModel>) {
    return LogBrackhitCreationModel.query().insertAndFetch(data);
  }

  saveUserBrackhitPushrecLog(data: PartialModelObject<LogUserBrackhitPushrecModel>) {
    return LogUserBrackhitPushrecModel.query().insertAndFetch(data);
  }

  saveBrackhitDownloadLog(data: PartialModelObject<LogBrackhitDownloadModel>) {
    return LogBrackhitDownloadModel.query().insertAndFetch(data);
  }

  saveMakeBrackhitLog(data: PartialModelObject<LogBrackhitCreateButtonModel>) {
    return LogBrackhitCreateButtonModel.query().insertAndFetch(data);
  }

  saveUserDeleteLog(data: PartialModelObject<LogDeletedUsersModel>, trx?: Transaction) {
    return LogDeletedUsersModel.query(trx)
      .insert(data)
      .onConflict()
      .merge(['brackhitsCreated', 'createdAt', 'timestamp']);
  }

  saveBrackhitPreviewLog(data: PartialModelObject<LogBrackhitPreviewModel>) {
    return LogBrackhitPreviewModel.query().insertAndFetch(data);
  }

  saveBrackhitUserHomeLog(data: PartialModelObject<LogBrackhitUserHomeModel>) {
    return LogBrackhitUserHomeModel.query().insertAndFetch(data);
  }

  saveFeedScrollLog(data: PartialModelObject<LogFeedItemsModel>) {
    return LogFeedItemsModel.query().insertAndFetch(data);
  }

  saveContentLog(data: PartialModelObject<LogContentModel>) {
    return LogContentModel.query().insertAndFetch(data);
  }

  updateContentLog(id: number, data: PartialModelObject<LogContentModel>) {
    return LogContentModel.query().updateAndFetchById(id, data);
  }

  deleteContentLog(id: number) {
    return LogContentModel.query().deleteById(id);
  }

  deleteContentLogByCentralId(centralId: string) {
    return LogContentModel.query().delete().where({ centralId });
  }

  getContentLogById(id: number) {
    return LogContentModel.query().findById(id);
  }

  findContentLog(data: PartialModelObject<LogContentModel>) {
    return LogContentModel.query().findOne(data);
  }
}
