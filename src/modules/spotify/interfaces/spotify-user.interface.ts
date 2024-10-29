export interface GetUserPlaylistsParams {
  accessToken: string;
  offset: number;
  limit: number;
}

export interface SpotifyPlaylistsValidationParams {
  spotifyUserId: string;
  size: number;
}

// data required to call Spotify API from spotify user
export interface SpotifyUserAccessData {
  accessToken?: string;
  spotifyUserId?: string;
}
