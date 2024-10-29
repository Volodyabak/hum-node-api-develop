import { SpotifyTrackModel } from '../../../../database/Models';
import { PlaylistTrackDto, SpotifyTrackDto, SpotifyUserPlaylistsDto } from '../dto/spotify.dto';
import { SpotifyPlaylistsValidationParams } from '../interfaces/spotify-user.interface';
import { SpotifyUtils } from '../utils/spotify.utils';

export class SpotifyParser {
  static parseSpotifyTrack(track: SpotifyApi.TrackObjectFull): SpotifyTrackDto {
    if (!track) return null;
    return {
      trackKey: track.id,
      trackName: track.name,
      trackPreview: track.preview_url,
      isrc: track.external_ids.isrc,
      popularity: track.popularity,
      album: {
        albumKey: track.album.id,
        name: track.album.name,
        albumImage: track.album.images[1]?.url, // 300x300 image
        albumType: track.album.album_type,
        releaseDate: new Date(track.album.release_date),
        releaseDatePrecision: track.album.release_date_precision,
        artists: track.album.artists.map((el) => ({ artistKey: el.id, artistName: el.name })),
      },
      artists: track.artists.map((el) => ({ artistKey: el.id, artistName: el.name })),
    };
  }

  static parsePlaylistTrack(track: SpotifyTrackModel): PlaylistTrackDto {
    return {
      id: track.id,
      trackKey: track.trackKey,
      trackName: track.trackName,
      trackPreview: track.trackPreview,
      trackUri: track.trackUri,
      isrc: track.isrc,
      popularity: track.popularity,
      lastChecked: track.lastChecked,
      albumImage: track.album.albumImage,
    };
  }

  static parseUserPlaylist(
    el: SpotifyApi.PlaylistObjectSimplified,
    params: SpotifyPlaylistsValidationParams,
  ): SpotifyUserPlaylistsDto {
    const data = SpotifyUtils.isPlaylistAllowedForBrackhitCreation(el, params);
    return {
      key: el.id,
      name: el.name,
      image: el.images[0]?.url || null,
      totalTracks: el.tracks.total,
      isAllowed: data.isAllowed,
      message: data.message,
    };
  }
}
