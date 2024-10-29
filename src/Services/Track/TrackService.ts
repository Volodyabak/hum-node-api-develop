import {
  GET_HOT_TAKE_CONTENT_META,
  GET_TRACK_INFO,
  GET_TRACK_INFO_WITH_ALBUM_NAMES,
} from '../../Queries';
import Tools from '../../Tools';
import { DEFAULT_ALBUM_IMAGE } from '../../constants';
import { S3Service } from '../../modules/aws/services/s3.service';
import { AppSettingsStateDto } from '../../modules/app-settings/dto/app-settings.dto';

class TrackService {
  private s3Service;

  constructor() {
    this.s3Service = new S3Service();
  }

  async getTrackInfo(trackId, settings: AppSettingsStateDto, withAlbumName = false) {
    const track = withAlbumName
      ? await this.getTrackInfoAlbumName(trackId)
      : await this.getTrackInfoDefault(trackId);

    if (!settings.showAlbumImages) {
      track.albumImage = this.s3Service.getSignedUrl(DEFAULT_ALBUM_IMAGE);
    }

    if (!settings.showTrackPreviews) {
      track.preview = null;
    }

    return track;
  }

  async getTrackInfoDefault(trackId) {
    const [track] = await Tools.promisifiedQuery(
      GET_TRACK_INFO,
      {
        trackId,
      },
      'TrackService getTrackInfoDefault() GET_TRACK_INFO Error: ',
    );

    return track;
  }

  async getTrackInfoAlbumName(trackId) {
    const [track] = await Tools.promisifiedQuery(
      GET_TRACK_INFO_WITH_ALBUM_NAMES,
      {
        trackId,
      },
      'TrackService getTrackInfoAlbumName() GET_TRACK_INFO_WITH_ALBUM_NAMES Error: ',
    );

    return track;
  }

  async joinContentMetaToHotTake(hotTake, settings: AppSettingsStateDto) {
    if (!hotTake && !hotTake.firstChoiceId && !hotTake.secondChoiceId) {
      throw new Error(
        `Invalid argument=${hotTake} for TrackService.joinContentMetaToHotTake() function`,
      );
    }

    hotTake.firstChoiceContent = await this.getHotTakeContentMeta(hotTake.firstChoiceId, settings);
    hotTake.secondChoiceContent = await this.getHotTakeContentMeta(
      hotTake.secondChoiceId,
      settings,
    );
  }

  async getHotTakeContentMeta(choiceId, settings: AppSettingsStateDto) {
    const [content] = await Tools.promisifiedQuery(
      GET_HOT_TAKE_CONTENT_META,
      {
        choiceId,
      },
      'TrackService getHotTakeContentMeta() GET_HOT_TAKE_CONTENT_META Error: ',
    );

    if (!settings.showAlbumImages) {
      content.albumImage = DEFAULT_ALBUM_IMAGE;
    }

    return content;
  }
}

const instance = new TrackService();
export { instance as TrackService };
