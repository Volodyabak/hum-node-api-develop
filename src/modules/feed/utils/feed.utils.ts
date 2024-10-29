import {
  SPOTIFY_ALBUM_SHARE_LINK_BASE,
  YOUTUBE_VIDEO_SHARE_LINK_BASE,
} from '../constants/feed.constants';

export class FeedUtils {
  static getSpotifyAlbumShareLink(albumKey: string) {
    return SPOTIFY_ALBUM_SHARE_LINK_BASE + albumKey;
  }

  static getYoutubeVideoShareLink(videoKey: string) {
    return YOUTUBE_VIDEO_SHARE_LINK_BASE + videoKey;
  }
}
