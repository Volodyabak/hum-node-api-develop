import { SpotifyTrackModel } from '@database/Models';
import { TrackInfoDto } from '../../tracks/tracks.dto';
import { AppSettingsStateDto } from '../../app-settings/dto/app-settings.dto';
import { DEFAULT_ALBUM_IMAGE } from '../../../constants';

export function formatTrackResponse(
  track: SpotifyTrackModel,
  settings?: AppSettingsStateDto,
): TrackInfoDto {
  if (!track) return null;

  if (settings && !settings.showAlbumImages) {
    track.album.albumImage = DEFAULT_ALBUM_IMAGE;
  }

  if (settings && !settings.showTrackPreviews) {
    track.trackPreview = null;
    track.appleTrackPreview = null;
  }

  return {
    id: track.id,
    trackKey: track.trackKey,
    trackName: track.trackName,
    artists: track.artists.map((a) => a?.artistName).join(', '),
    albumName: track.album?.name,
    albumImage: track.album?.albumImage,
    preview: track.trackPreview || track.appleTrack?.trackPreview || null,
  };
}
