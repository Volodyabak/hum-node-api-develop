import {
  LogArtistProfileModel,
  LogBrackhitVisitsModel,
  LogCompareModel,
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
import { PartialModelObject } from 'objection';

export interface IAnalyticsRepository {
  saveArtistViewLog(data: PartialModelObject<LogArtistProfileModel>);
  saveSpotifyTrackLog(data: PartialModelObject<LogSpotifyTrackModel>);
  saveYoutubeVideoLog(data: PartialModelObject<LogYoutubeVideoModel>);
  saveProfileViewLog(data: PartialModelObject<LogProfileVisitsModel>);
  saveSpotifySkipLog(data: PartialModelObject<LogSpotifySigninSkipModel>);
  saveBottomNavLog(data: PartialModelObject<LogUserNavModel>);
  saveBrackhitVisitLog(data: PartialModelObject<LogBrackhitVisitsModel>);
  saveUpdateLog(data: PartialModelObject<LogUpdateModel>);
  saveShareLog(data: PartialModelObject<LogShareModel>);
  saveScreenshotLog(data: PartialModelObject<LogScreenshotModel>);
  saveCompareLog(data: PartialModelObject<LogCompareModel>);
  saveHubsLog(data: PartialModelObject<LogHubsModel>);
  saveNewsArticleLog(data: PartialModelObject<LogNewsitemModel>);
}
