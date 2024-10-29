import { SpotifyPlaylistSort, SpotifyPlaylistValidationMessage } from '../constants';

export interface ISpotifySdk {
  getArtist(artistId: string): Promise<SpotifyApi.SingleArtistResponse>;

  getPlaylistId(playlistLink: string): string;

  getPlaylist(playlistId: string): Promise<SpotifyApi.SinglePlaylistResponse>;

  getPlaylistTracks(
    playlistId: string,
    offset: number,
    limit: number,
  ): Promise<SpotifyApi.PlaylistTrackResponse>;
}

export interface IPlaylistService {
  createPlaylist(tracks: SpotifyApi.TrackObjectFull[], sort: SpotifyPlaylistSort);
}

export interface SpotifySdkAuthResponse {
  access_token: string;
  expires_in: number;
}

export interface SpotifyRefreshTokenBody {
  access_token: string;
  refresh_token?: string | undefined;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface SpotifyPlaylistValidation {
  isAllowed: 0 | 1;
  message: SpotifyPlaylistValidationMessage | undefined;
}
